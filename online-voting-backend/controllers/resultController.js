const Vote = require("../models/Vote");
const Election = require("../models/Election");
const Party = require("../models/Party");
const AppError = require("../utils/AppError");
const {
  getElectionPartyIds,
  notifyPartyIds,
} = require("../utils/electionPartyNotifications");

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
        const title = isWinner ? "Election result: You won" : "Election result: You lost";
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

// Calculate results with tie handling
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

    // Aggregate votes per candidate (candidateId can be null in party-only voting)
    const candidateVotes = await Vote.aggregate([
      { $match: { electionId: election._id, candidateId: { $ne: null } } },
      { $group: { _id: "$candidateId", totalVotes: { $sum: 1 } } },
      { $sort: { totalVotes: -1 } },
    ]);

    // No votes yet
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
      election.resultsPublishedAt = new Date();
      await election.save();

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

    // Save results
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
    election.resultsPublishedAt = new Date();
    await election.save();

    await publishResultNotifications(election);

    const populatedResults = await Election.findById(electionId)
      .populate("results.candidateId", "fullName partyName profileImage")
      .populate("winnerIds", "fullName partyName profileImage");

    res.status(200).json({
      status: "success",
      data: populatedResults,
    });
  } catch (err) {
    next(err);
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
    if (!hasResults)
      return next(new AppError("Results not available yet", 400));

    res.status(200).json({
      status: "success",
      data: election,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/results/party/:electionId
const getPartyStandings = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId).select("_id title totalVotes");
    if (!election) return next(new AppError("Election not found", 404));

    const partyVotes = await Vote.aggregate([
      { $match: { electionId: election._id, partyId: { $ne: null } } },
      { $group: { _id: "$partyId", votes: { $sum: 1 } } },
      { $sort: { votes: -1 } },
    ]);

    if (!partyVotes.length) {
      return res.status(200).json({
        status: "success",
        data: {
          electionId: election._id,
          totalVotes: Number(election.totalVotes || 0),
          parties: [],
          winner: null,
          runnerUp: null,
        },
      });
    }

    const partyIds = partyVotes.map((item) => item._id).filter(Boolean);
    const parties = await Party.find({ _id: { $in: partyIds } })
      .select("_id name logo symbol color shortName")
      .lean();

    const byId = new Map(parties.map((item) => [item._id.toString(), item]));
    const totalVotes = partyVotes.reduce((sum, item) => sum + Number(item.votes || 0), 0);

    const ranked = partyVotes
      .map((item, index) => {
        const ref = byId.get(item._id.toString()) || {};
        const votes = Number(item.votes || 0);
        return {
          id: item._id.toString(),
          rank: index + 1,
          name: ref.name || "Party",
          shortName: ref.shortName || "",
          logo: ref.logo || ref.symbol || "",
          color: ref.color || "#2563eb",
          votes,
          percentage: totalVotes ? Number(((votes / totalVotes) * 100).toFixed(2)) : 0,
        };
      })
      .sort((a, b) => b.votes - a.votes);

    res.status(200).json({
      status: "success",
      data: {
        electionId: election._id,
        totalVotes,
        parties: ranked,
        winner: ranked[0] || null,
        runnerUp: ranked[1] || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { calculateResults, getResults, getPartyStandings };
