const mongoose = require("mongoose");
const Party = require("../models/Party");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

const normalizeEmail = (email = "") => String(email || "").trim().toLowerCase();
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveParty = async (req) => {
  let partyId = req.params.partyId || null;

  if (!partyId) {
    partyId = req.user?.partyId || null;
  }

  if (!partyId && req.user?.role === "party" && req.user?.email) {
    const emailRegex = new RegExp(`^${escapeRegex(normalizeEmail(req.user.email))}$`, "i");
    const partyByEmail = await Party.findOne({ email: emailRegex }).sort({ createdAt: -1 });
    if (partyByEmail?._id) {
      partyId = partyByEmail._id;
    }
  }

  if (!partyId) throw new AppError("Party ID not found", 400);

  const party = await Party.findById(partyId);
  if (!party) throw new AppError("Party not found", 404);
  return party;
};

const isEditingLocked = (election) => {
  if (!election) return false;
  if (!election.startDate) return false;
  const diffMs = new Date(election.startDate).getTime() - Date.now();
  return diffMs <= 24 * 60 * 60 * 1000; // 24 hours
};

const deriveElectionStatus = (election = {}, now = new Date()) => {
  const start = election.startDate ? new Date(election.startDate) : null;
  const end = election.endDate ? new Date(election.endDate) : null;
  const raw = String(election.status || "").toLowerCase();

  if (raw === "ended" || election.isEnded || election.allowVoting === false) return "Ended";
  if (end && now > end) return "Ended";
  if (start && now < start) return "Upcoming";
  if (start && end && now >= start && now <= end && election.allowVoting !== false) {
    return "Running";
  }
  if (raw === "running" || raw === "upcoming") return raw[0].toUpperCase() + raw.slice(1);
  return "Upcoming";
};

const findRelevantElectionForParty = async (party, now = new Date()) => {
  const partyTypeRegex = party?.electionType
    ? new RegExp(`^${escapeRegex(String(party.electionType))}$`, "i")
    : null;

  const runningFilter = {
    startDate: { $lte: now },
    endDate: { $gte: now },
    allowVoting: { $ne: false },
    isEnded: { $ne: true },
  };
  if (partyTypeRegex) {
    runningFilter.type = partyTypeRegex;
  }
  const runningElection = await Election.findOne(runningFilter).sort({ startDate: -1 });
  if (runningElection) return runningElection;

  if (party?.electionId) {
    const linkedElection = await Election.findById(party.electionId);
    if (linkedElection && deriveElectionStatus(linkedElection, now) !== "Ended") {
      return linkedElection;
    }
  }

  const upcomingFilter = {
    startDate: { $gt: now },
    isEnded: { $ne: true },
  };
  if (partyTypeRegex) {
    upcomingFilter.type = partyTypeRegex;
  }
  const upcomingElection = await Election.findOne(upcomingFilter).sort({ startDate: 1 });
  if (upcomingElection) return upcomingElection;

  const fallbackUpcoming = await Election.findOne({
    startDate: { $gt: now },
    isEnded: { $ne: true },
  }).sort({ startDate: 1 });

  if (fallbackUpcoming) return fallbackUpcoming;

  return upcomingElection || null;
};

const sanitizeTeamMembers = (teamMembers = []) => {
  if (!Array.isArray(teamMembers)) return [];
  return teamMembers
    .map((member = {}) => ({
      name: String(member.name || "").trim(),
      role: String(member.role || member.position || "").trim(),
      position: String(member.position || member.role || "").trim(),
      photo: member.photo || "",
      bio: String(member.bio || "").trim(),
    }))
    .filter((member) => Boolean(member.name));
};

// GET /api/party/profile/:partyId?
const getPartyProfileFull = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const election = await findRelevantElectionForParty(party);
    res.json({
      data: {
        id: party._id,
        name: party.name,
        leader: party.leader,
        vision: party.vision,
        manifesto: party.manifesto,
        logo: party.logo,
        teamMembers: party.teamMembers || [],
        isEditingLocked: isEditingLocked(election),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/party/profile/:partyId?
const updatePartyProfileFull = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const election = await findRelevantElectionForParty(party);
    if (isEditingLocked(election)) {
      return next(new AppError("Editing locked within 24 hours of election start", 403));
    }

    const allowed = ["name", "leader", "vision", "manifesto", "teamMembers", "logo"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "teamMembers") {
          party.teamMembers = sanitizeTeamMembers(req.body.teamMembers);
        } else {
          party[field] = req.body[field];
        }
      }
    });

    await party.save();
    if (req.user?._id) {
      await Notification.create({
        userId: req.user._id,
        type: "info",
        title: "Profile updated",
        message: "Your party profile has been updated.",
      }).catch(() => {});
    }
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    next(error);
  }
};

// GET /api/party/future-plans/:partyId?
const getFuturePlans = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const election = await findRelevantElectionForParty(party);
    res.json({
      data: {
        futurePlans: party.futurePlans || [],
        isEditingLocked: isEditingLocked(election),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/party/future-plans/:partyId?
const updateFuturePlans = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const election = await findRelevantElectionForParty(party);
    if (isEditingLocked(election)) {
      return next(new AppError("Editing locked within 24 hours of election start", 403));
    }

    const { futurePlans } = req.body;
    if (!Array.isArray(futurePlans)) {
      return next(new AppError("futurePlans must be an array", 400));
    }
    if (futurePlans.length > 50) {
      return next(new AppError("Maximum 50 plans allowed", 400));
    }

    party.futurePlans = futurePlans.filter((p) => p && p.trim());
    await party.save();
    if (req.user?._id) {
      await Notification.create({
        userId: req.user._id,
        type: "info",
        title: "Future plans updated",
        message: "Your future plans have been updated.",
      }).catch(() => {});
    }
    res.json({ success: true, count: party.futurePlans.length });
  } catch (error) {
    next(error);
  }
};

// GET /api/party/progress/:partyId
const getProgress = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const development = party.development ?? party.goodWorkPercent ?? 0;
    const damage = 100 - development;
    res.json({
      data: {
        development,
        damage,
        goodWork: party.goodWork ?? party.goodWorkPercent ?? 0,
        badWork: party.badWork ?? party.badWorkPercent ?? 0,
        detailedMetrics: party.detailedMetrics || {},
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/party/past-performance/:partyId
const getPastPerformance = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const manualHistory = Array.isArray(party.historicalData) ? party.historicalData : [];

    const endedElections = await Election.find({
      $or: [
        { status: "Ended" },
        { isEnded: true },
        { endDate: { $lte: new Date() } },
      ],
    })
      .select("_id title endDate")
      .lean();
    const endedElectionIds = endedElections.map((item) => item._id);

    let electionHistory = [];
    if (endedElectionIds.length) {
      const voteAgg = await Vote.aggregate([
        { $match: { electionId: { $in: endedElectionIds }, partyId: { $ne: null } } },
        {
          $group: {
            _id: {
              electionId: "$electionId",
              partyId: "$partyId",
            },
            votes: { $sum: 1 },
          },
        },
      ]);

      const byElection = voteAgg.reduce((acc, row) => {
        const key = row._id?.electionId?.toString();
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push({
          partyId: row._id?.partyId?.toString(),
          votes: Number(row.votes || 0),
        });
        return acc;
      }, {});

      electionHistory = endedElections
        .map((election) => {
          const rows = byElection[election._id.toString()] || [];
          if (!rows.length) return null;

          const ranked = [...rows].sort((a, b) => b.votes - a.votes);
          const ownIndex = ranked.findIndex(
            (item) => item.partyId === party._id.toString(),
          );
          if (ownIndex === -1) return null;

          const yearSource = election.endDate ? new Date(election.endDate) : new Date();
          return {
            year: yearSource.getFullYear(),
            election: election.title || "Election",
            votes: ranked[ownIndex].votes,
            position: ownIndex + 1,
            totalParties: ranked.length,
            won: ownIndex === 0,
          };
        })
        .filter(Boolean);
    }

    const normalizedManualHistory = manualHistory.map((item, index) => ({
      year: item.year || new Date().getFullYear() - index,
      election: item.election || item.title || `Election ${item.year || index + 1}`,
      votes: Number(item.votes || 0),
      position: Number(item.position || 0) || null,
      totalParties: Number(item.totalParties || 0) || null,
      won: Boolean(item.won || Number(item.position || 0) === 1),
    }));

    const mergedMap = new Map();
    normalizedManualHistory.forEach((item) => {
      const key = `${item.election}-${item.year}`;
      mergedMap.set(key, item);
    });
    electionHistory.forEach((item) => {
      const key = `${item.election}-${item.year}`;
      mergedMap.set(key, item);
    });

    const aggregated = [...mergedMap.values()]
      .sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
      .slice(0, 5);

    const totalWins = aggregated.filter((item) => item.won).length;
    const averageVotes =
      aggregated.length > 0
        ? Math.round(
            aggregated.reduce((acc, current) => acc + Number(current.votes || 0), 0) /
              aggregated.length,
          )
        : 0;
    const winRate =
      aggregated.length > 0 ? `${((totalWins / aggregated.length) * 100).toFixed(1)}%` : "0%";

    res.json({
      data: {
        pastElections: aggregated,
        summary: {
          totalWins,
          averageVotes,
          winRate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/party/current-stats/:partyId
const getCurrentStats = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const now = new Date();

    const election = await findRelevantElectionForParty(party, now);

    if (!election) {
      const emptyStats = {
        ownVotes: 0,
        ownPosition: 0,
        voteShare: 0,
        leadOverSecond: 0,
      };
      return res.json({
        data: {
          currentElection: null,
          stats: emptyStats,
          metrics: emptyStats,
          allParties: [],
          totalVotes: 0,
        },
      });
    }

    const voteAgg = await Vote.aggregate([
      {
        $match: {
          electionId: new mongoose.Types.ObjectId(election._id),
          partyId: { $ne: null },
        },
      },
      { $group: { _id: "$partyId", votes: { $sum: 1 } } },
      { $sort: { votes: -1 } },
    ]);

    const votesByPartyId = new Map(
      voteAgg.map((row) => [row._id?.toString(), Number(row.votes || 0)]),
    );

    const fromParticipatingList = Array.isArray(election.participatingParties)
      ? election.participatingParties
          .map((row) => row?.partyId?.toString?.() || row?.partyId || null)
          .filter(Boolean)
      : [];

    const requestedPartyIds = [...new Set([...fromParticipatingList, party._id.toString()])];
    const votedPartyIds = [...votesByPartyId.keys()];
    const electionTypeRegex = election?.type
      ? new RegExp(`^${escapeRegex(String(election.type))}$`, "i")
      : null;

    const partiesById = new Map();
    const mergeParties = (items = []) => {
      items.forEach((item) => {
        const id = item?._id?.toString?.();
        if (id) partiesById.set(id, item);
      });
    };

    if (requestedPartyIds.length) {
      const linkedParties = await Party.find({ _id: { $in: requestedPartyIds } }).lean();
      mergeParties(linkedParties);
    }

    if (votedPartyIds.length) {
      const votedParties = await Party.find({ _id: { $in: votedPartyIds } }).lean();
      mergeParties(votedParties);
    }

    if (partiesById.size <= 1) {
      const fallbackFilter = {
        status: { $nin: ["rejected", "blocked"] },
        $or: [{ electionId: election._id }, { isActive: true }, { status: "approved" }],
      };
      if (electionTypeRegex) {
        fallbackFilter.$or.push({ electionType: electionTypeRegex });
      }
      const fallbackParties = await Party.find(fallbackFilter).lean();
      mergeParties(fallbackParties);
    }

    if (partiesById.size <= 1) {
      const broadFallback = await Party.find({
        status: { $nin: ["rejected", "blocked"] },
      }).lean();
      mergeParties(broadFallback);
    }

    if (!partiesById.has(party._id.toString())) {
      const ownParty = await Party.findById(party._id).lean();
      if (ownParty?._id) mergeParties([ownParty]);
    }

    const electionParties = [...partiesById.values()];

    const partiesWithNames = electionParties.map((item) => ({
      partyId: item._id,
      name: item.name || "Unknown",
      logo: item.logo || item.symbol,
      color: item.color || "#7c7cff",
      development: item.development ?? item.goodWorkPercent ?? 0,
      votes: votesByPartyId.get(item._id.toString()) || 0,
    }));

    const sorted = partiesWithNames.sort((a, b) => {
      if (b.votes === a.votes) {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }
      return b.votes - a.votes;
    });

    const totalVotes = sorted.reduce((acc, cur) => acc + Number(cur.votes || 0), 0);
    const own = sorted.find((p) => p.partyId?.toString() === party._id.toString()) || {
      votes: 0,
    };
    const ownPosition = sorted.findIndex(
      (p) => p.partyId?.toString() === party._id.toString(),
    );
    const voteShare = totalVotes ? Number(((own.votes / totalVotes) * 100).toFixed(2)) : 0;
    const leadOverSecond =
      sorted.length > 1 ? (ownPosition === 0 ? own.votes - sorted[1].votes : 0) : own.votes;

    res.json({
      data: {
        currentElection: {
          id: election._id,
          title: election.title || election.name || "Election",
          status: deriveElectionStatus(election, now),
          startDate: election.startDate,
          endDate: election.endDate,
        },
        stats: {
          ownVotes: own.votes || 0,
          ownPosition: ownPosition >= 0 ? ownPosition + 1 : 0,
          voteShare,
          leadOverSecond,
        },
        allParties: sorted.map((p, idx) => ({
          name: p.name,
          votes: p.votes,
          position: idx + 1,
          isOwn: p.partyId?.toString() === party._id.toString(),
          logo: p.logo,
          color: p.color,
          development: p.development,
        })),
        totalVotes,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPartyProfileFull,
  updatePartyProfileFull,
  getFuturePlans,
  updateFuturePlans,
  getProgress,
  getPastPerformance,
  getCurrentStats,
};
