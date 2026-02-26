const mongoose = require("mongoose");
const Party = require("../models/Party");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const AppError = require("../utils/AppError");

const normalizeEmail = (email = "") => String(email || "").trim().toLowerCase();
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveParty = async (req) => {
  let partyId = req.params.partyId || null;

  if (req.user?.role === "party" && req.user?.email) {
    const emailRegex = new RegExp(`^${escapeRegex(normalizeEmail(req.user.email))}$`, "i");
    const partyByEmail = await Party.findOne({ email: emailRegex }).sort({ createdAt: -1 });
    if (partyByEmail?._id) {
      partyId = partyByEmail._id;
    }
  }

  if (!partyId) {
    partyId = req.user?.partyId || null;
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

// GET /api/party/profile/:partyId?
const getPartyProfileFull = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    res.json({
      data: {
        id: party._id,
        name: party.name,
        leader: party.leader,
        vision: party.vision,
        manifesto: party.manifesto,
        logo: party.logo,
        teamMembers: party.teamMembers || [],
        isEditingLocked: false, // computed client-side after fetching election if needed
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
    const election = await Election.findById(party.electionId);
    if (isEditingLocked(election)) {
      return next(new AppError("Editing locked within 24 hours of election start", 403));
    }

    const allowed = ["name", "leader", "vision", "manifesto", "teamMembers", "logo"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        party[field] = req.body[field];
      }
    });

    await party.save();
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    next(error);
  }
};

// GET /api/party/future-plans/:partyId?
const getFuturePlans = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const election = await Election.findById(party.electionId);
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
    const election = await Election.findById(party.electionId);
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
      $or: [{ status: "Ended" }, { isEnded: true }],
    })
      .select("_id title endDate")
      .lean();
    const endedElectionIds = endedElections.map((item) => item._id);

    let electionHistory = [];
    if (endedElectionIds.length) {
      const voteAgg = await Vote.aggregate([
        { $match: { electionId: { $in: endedElectionIds } } },
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

    const election =
      (await Election.findOne({
        _id: party.electionId,
        status: { $in: ["Running", "Upcoming"] },
      })) ||
      (await Election.findOne({ status: "Running" }).sort({ startDate: -1 }));

    if (!election) {
      return res.json({
        data: {
          currentElection: null,
          metrics: {
            ownVotes: 0,
            ownPosition: 0,
            voteShare: 0,
            leadOverSecond: 0,
          },
          allParties: [],
          totalVotes: 0,
        },
      });
    }

    const voteAgg = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(election._id) } },
      { $group: { _id: "$partyId", votes: { $sum: 1 } } },
      { $sort: { votes: -1 } },
    ]);

    const votesByPartyId = new Map(
      voteAgg.map((row) => [row._id?.toString(), Number(row.votes || 0)]),
    );

    const electionParties = await Party.find({
      $or: [{ electionId: election._id }, { _id: party._id }],
    }).lean();

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
          status: election.status,
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
