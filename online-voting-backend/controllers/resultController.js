const Vote = require("../models/Vote");
const Election = require("../models/Election");
const Party = require("../models/Party");
const AppError = require("../utils/AppError");
const { calculatePRResult } = require("../utils/prEngine");
const { writeAuditLog } = require("../utils/audit");
const {
  getElectionPartyIds,
  notifyPartyIds,
} = require("../utils/electionPartyNotifications");

const isBlockedParty = (party = {}) => {
  const status = String(party?.status || "").toLowerCase();
  return ["blocked", "rejected"].includes(status);
};

const buildPartyVoteRows = async (election) => {
  const partyVotes = await Vote.aggregate([
    { $match: { electionId: election._id, partyId: { $ne: null } } },
    { $group: { _id: "$partyId", votes: { $sum: 1 } } },
  ]);

  const votesByParty = new Map();
  partyVotes.forEach((item) => {
    if (!item?._id) return;
    votesByParty.set(item._id.toString(), Number(item.votes || 0));
  });

  const electionPartyRows = Array.isArray(election.participatingParties)
    ? election.participatingParties
    : [];
  electionPartyRows.forEach((row) => {
    const id = row?.partyId?.toString?.() || row?.partyId;
    if (!id) return;
    const existing = Number(votesByParty.get(id) || 0);
    votesByParty.set(id, Math.max(existing, Number(row?.votes || 0)));
  });

  if (!votesByParty.size) {
    const electionTypeRegex = election?.type
      ? new RegExp(
          `^${String(election.type).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        )
      : null;
    const activeParties = await Party.find({
      status: "approved",
      isActive: true,
      ...(electionTypeRegex ? { electionType: electionTypeRegex } : {}),
    })
      .select("_id")
      .lean();
    activeParties.forEach((item) => {
      const id = item?._id?.toString?.();
      if (id) votesByParty.set(id, 0);
    });
  }

  const partyIds = [...votesByParty.keys()];
  if (!partyIds.length) {
    return {
      rows: [],
      totalVotes: 0,
      votesByParty,
      partyById: new Map(),
    };
  }

  const parties = await Party.find({ _id: { $in: partyIds } })
    .select("_id name shortName logo symbol color status isActive")
    .lean();
  const partyById = new Map(parties.map((item) => [item._id.toString(), item]));

  const rows = partyIds
    .map((id) => {
      const ref = partyById.get(id) || {};
      if (ref?._id && isBlockedParty(ref)) return null;
      return {
        partyId: id,
        partyName: ref.name || "Party",
        shortName: ref.shortName || "",
        votes: Number(votesByParty.get(id) || 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.votes === a.votes) return a.partyName.localeCompare(b.partyName);
      return b.votes - a.votes;
    });

  const totalVotes = rows.reduce((sum, row) => sum + Number(row.votes || 0), 0);

  return { rows, totalVotes, votesByParty, partyById };
};

const persistPartySnapshots = async (electionId, standings = [], totalVotes = 0) => {
  if (!Array.isArray(standings) || !standings.length) return;
  const ops = standings.map((row) => ({
    updateOne: {
      filter: { _id: row.partyId },
      update: {
        $set: {
          currentVotes: Number(row.votes || 0),
          totalVotes: Number(row.votes || 0),
          votePercentage: Number(row.votePercentage || 0),
          allocatedSeats: Number(row.seats || 0),
          latestResultElectionId: electionId,
          "statistics.totalVotesReceived": Number(row.votes || 0),
          "statistics.averageVoteShare": Number(row.votePercentage || 0),
        },
      },
    },
  }));

  await Party.bulkWrite(ops, { ordered: false }).catch((error) => {
    console.error("Failed to persist party snapshots:", error.message);
  });
};

const publishResultNotifications = async (election, { noVotes = false } = {}) => {
  try {
    const partyIds = await getElectionPartyIds(election, {
      includeElectionLinked: true,
      includeVotes: true,
      includeActiveFallback: false,
    });
    if (!partyIds.length) return;

    if (noVotes) {
      await notifyPartyIds(partyIds, {
        type: "info",
        title: "Election result published",
        message: `${election.title} has ended with no votes recorded.`,
      });
      return;
    }

    await notifyPartyIds(partyIds, {
      type: "info",
      title: "Election result published",
      message: `Final result for ${election.title} has been published.`,
    });

    const voteAgg = await Vote.aggregate([
      { $match: { electionId: election._id, partyId: { $ne: null } } },
      { $group: { _id: "$partyId", votes: { $sum: 1 } } },
    ]);
    const votesByPartyId = new Map(
      voteAgg.map((row) => [row._id?.toString(), Number(row.votes || 0)]),
    );

    const parties = await Party.find({ _id: { $in: partyIds } })
      .select("_id name")
      .lean();
    const partyInfo = new Map(parties.map((item) => [item._id.toString(), item]));

    const ranked = partyIds
      .map((id) => ({
        partyId: id,
        name: partyInfo.get(id)?.name || "Your party",
        votes: votesByPartyId.get(id) || 0,
      }))
      .sort((a, b) => {
        if (b.votes === a.votes) return a.name.localeCompare(b.name);
        return b.votes - a.votes;
      });

    const topVotes = ranked[0]?.votes || 0;
    const winnerCount =
      topVotes > 0 ? ranked.filter((item) => item.votes === topVotes).length : 0;

    await Promise.all(
      ranked.map((entry, index) => {
        const rank = index + 1;
        const isWinner = topVotes > 0 && entry.votes === topVotes;
        const title = isWinner
          ? "Election result: You won"
          : "Election result: You lost";
        const message = isWinner
          ? winnerCount > 1
            ? `${election.title}: your party finished joint #1 with ${entry.votes.toLocaleString()} votes.`
            : `${election.title}: your party won with ${entry.votes.toLocaleString()} votes.`
          : `${election.title}: your party received ${entry.votes.toLocaleString()} votes and finished #${rank} of ${ranked.length}.`;

        return notifyPartyIds([entry.partyId], {
          type: isWinner ? "success" : "warning",
          title,
          message,
        });
      }),
    );
  } catch (error) {
    console.error("Failed to publish result notifications:", error.message);
  }
};

const ensurePRSummary = async (election) => {
  if (
    election?.prResult?.standings &&
    Array.isArray(election.prResult.standings) &&
    election.prResult.standings.length
  ) {
    return election.prResult;
  }

  const { rows } = await buildPartyVoteRows(election);
  const summary = calculatePRResult({
    partyRows: rows,
    totalSeats: election.totalSeats || 100,
    method: election.prMethod || "DHONDT",
    thresholdPercent: election.partyThresholdPercent || 0,
  });
  return summary;
};

// Calculate results with tie handling + PR seat allocation
const calculateResults = async (req, res, next) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) return next(new AppError("Election not found", 404));

    if (election.resultsPublishedAt) {
      const existing = await Election.findById(electionId)
        .populate("results.candidateId", "fullName partyName profileImage")
        .populate("winnerIds", "fullName partyName profileImage");

      return res.status(200).json({
        status: "success",
        message: "Results already published",
        data: existing || election,
      });
    }

    const totalVotesCount = await Vote.countDocuments({ electionId: election._id });

    const candidateVotes = await Vote.aggregate([
      { $match: { electionId: election._id, candidateId: { $ne: null } } },
      { $group: { _id: "$candidateId", totalVotes: { $sum: 1 } } },
      { $sort: { totalVotes: -1 } },
    ]);

    const { rows: partyRows } = await buildPartyVoteRows(election);
    const prSummary = calculatePRResult({
      partyRows,
      totalSeats: election.totalSeats || 100,
      method: election.prMethod || "DHONDT",
      thresholdPercent: election.partyThresholdPercent || 0,
    });

    if (totalVotesCount === 0) {
      election.results = [];
      election.winnerIds = [];
      election.status = "Ended";
      election.isActive = false;
      election.allowVoting = false;
      election.isEnded = true;
      election.totalVotes = totalVotesCount;
      election.turnout =
        election.totalVoters > 0
          ? Number(((totalVotesCount / election.totalVoters) * 100).toFixed(2))
          : 0;
      election.prResult = prSummary;
      election.participatingParties = prSummary.standings.map((row) => ({
        partyId: row.partyId,
        votes: row.votes,
        percentage: row.votePercentage,
        seats: row.seats,
      }));
      election.resultsPublishedAt = new Date();
      election.resultFrozen = true;
      await election.save();

      await persistPartySnapshots(election._id, prSummary.standings, prSummary.totalVotes);
      await writeAuditLog({
        action: "ELECTION_RESULT_CALCULATED",
        userId: req.user?._id,
        userRole: req.user?.role || "admin",
        req,
        metadata: {
          electionId: election._id,
          title: election.title,
          totalVotes: totalVotesCount,
          noVotes: true,
        },
      });
      await publishResultNotifications(election, { noVotes: true });

      return res.status(200).json({
        status: "success",
        message: "Election ended with no votes yet",
        data: election,
      });
    }

    let winnerIds = [];
    if (candidateVotes.length > 0) {
      const maxVotes = candidateVotes[0].totalVotes;
      winnerIds = candidateVotes
        .filter((v) => v.totalVotes === maxVotes)
        .map((v) => v._id);
    }

    election.results = candidateVotes.map((v) => ({
      candidateId: v._id,
      totalVotes: v.totalVotes,
    }));
    election.winnerIds = winnerIds;
    election.status = "Ended";
    election.isActive = false;
    election.allowVoting = false;
    election.isEnded = true;
    election.totalVotes = totalVotesCount;
    election.turnout =
      election.totalVoters > 0
        ? Number(((election.totalVotes / election.totalVoters) * 100).toFixed(2))
        : 0;
    election.prResult = prSummary;
    election.participatingParties = prSummary.standings.map((row) => ({
      partyId: row.partyId,
      votes: row.votes,
      percentage: row.votePercentage,
      seats: row.seats,
    }));
    election.resultsPublishedAt = new Date();
    election.resultFrozen = true;
    await election.save();

    await persistPartySnapshots(election._id, prSummary.standings, prSummary.totalVotes);
    await writeAuditLog({
      action: "ELECTION_RESULT_CALCULATED",
      userId: req.user?._id,
      userRole: req.user?.role || "admin",
      req,
      metadata: {
        electionId: election._id,
        title: election.title,
        totalVotes: totalVotesCount,
        electionSystem: election.electionSystem || "FPTP",
        majorityType: prSummary?.majority?.type || null,
      },
    });
    await publishResultNotifications(election);

    const populatedResults = await Election.findById(electionId)
      .populate("results.candidateId", "fullName partyName profileImage")
      .populate("winnerIds", "fullName partyName profileImage");

    return res.status(200).json({
      status: "success",
      data: populatedResults,
    });
  } catch (err) {
    return next(err);
  }
};

// Voter-facing read-only results
const getResults = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.electionId)
      .populate("results.candidateId", "fullName partyName profileImage")
      .populate("winnerIds", "fullName partyName profileImage");

    if (!election) return next(new AppError("Election not found", 404));
    const hasResults =
      Boolean(election.resultsPublishedAt) ||
      (Array.isArray(election.results) && election.results.length > 0) ||
      (Array.isArray(election.winnerIds) && election.winnerIds.length > 0);
    if (!hasResults) return next(new AppError("Results not available yet", 400));

    return res.status(200).json({
      status: "success",
      data: election,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/results
const listPublishedResults = async (req, res, next) => {
  try {
    const elections = await Election.find({ resultsPublishedAt: { $ne: null } })
      .select(
        "_id title type electionSystem totalSeats totalVotes turnout resultsPublishedAt prResult.majority",
      )
      .sort({ resultsPublishedAt: -1 })
      .lean();

    return res.status(200).json({
      status: "success",
      data: elections,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/results/:electionId
const getResultSummary = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.electionId)
      .populate("results.candidateId", "fullName partyName profileImage")
      .populate("winnerIds", "fullName partyName profileImage");

    if (!election) return next(new AppError("Election not found", 404));

    const hasResults = Boolean(election.resultsPublishedAt);
    if (!hasResults) return next(new AppError("Results not available yet", 400));

    const prSummary = await ensurePRSummary(election);
    return res.status(200).json({
      status: "success",
      data: {
        electionId: election._id,
        title: election.title,
        electionSystem: election.electionSystem || "FPTP",
        totalVotes: election.totalVotes || 0,
        totalSeats: election.totalSeats || 0,
        turnout: election.turnout || 0,
        prResult: prSummary,
        winners: election.winnerIds || [],
      },
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/results/coalitions/:electionId
const getCoalitions = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.electionId).select(
      "_id title electionSystem totalSeats prMethod partyThresholdPercent resultsPublishedAt prResult participatingParties type",
    );
    if (!election) return next(new AppError("Election not found", 404));
    if (!election.resultsPublishedAt) {
      return next(new AppError("Coalitions are available after results publish", 400));
    }

    const prSummary = await ensurePRSummary(election);
    return res.status(200).json({
      status: "success",
      data: {
        electionId: election._id,
        title: election.title,
        electionSystem: election.electionSystem || "FPTP",
        totalSeats: prSummary.totalSeats || election.totalSeats || 0,
        majorityMark: prSummary.majorityMark || 0,
        majority: prSummary.majority || { type: "Coalition Required" },
        coalitionRequired: Boolean(prSummary.coalitionRequired),
        coalitionSuggestions: prSummary.coalitionSuggestions || [],
      },
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/results/party/:electionId
const getPartyStandings = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId).select(
      "_id title totalVotes participatingParties electionSystem totalSeats prResult",
    );
    if (!election) return next(new AppError("Election not found", 404));

    const { rows, totalVotes, partyById } = await buildPartyVoteRows(election);

    const prStandingMap = new Map(
      (Array.isArray(election?.prResult?.standings)
        ? election.prResult.standings
        : []
      ).map((row) => [String(row.partyId), row]),
    );

    const ranked = rows
      .map((row, index) => {
        const ref = partyById.get(String(row.partyId)) || {};
        const percentage =
          totalVotes > 0
            ? Number(((Number(row.votes || 0) / totalVotes) * 100).toFixed(2))
            : 0;
        const seatRow = prStandingMap.get(String(row.partyId));
        return {
          id: row.partyId,
          name: ref.name || row.partyName || "Party",
          shortName: ref.shortName || row.shortName || "",
          logo: ref.logo || ref.symbol || "",
          color: ref.color || "#2563eb",
          votes: Number(row.votes || 0),
          percentage,
          seats: Number(seatRow?.seats || 0),
          rank: index + 1,
        };
      })
      .sort((a, b) => {
        if (b.votes === a.votes) return a.name.localeCompare(b.name);
        return b.votes - a.votes;
      })
      .map((item, index) => ({ ...item, rank: index + 1 }));

    const winner = ranked.length && ranked[0].votes > 0 ? ranked[0] : null;
    const runnerUp = ranked.length > 1 && ranked[1].votes > 0 ? ranked[1] : null;

    return res.status(200).json({
      status: "success",
      data: {
        electionId: election._id,
        electionSystem: election.electionSystem || "FPTP",
        totalSeats: Number(election.totalSeats || 0),
        totalVotes: totalVotes || Number(election.totalVotes || 0),
        parties: ranked,
        winner,
        runnerUp,
        majority: election?.prResult?.majority || null,
        coalitionSuggestions: election?.prResult?.coalitionSuggestions || [],
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  calculateResults,
  listPublishedResults,
  getResults,
  getResultSummary,
  getCoalitions,
  getPartyStandings,
};
