const mongoose = require("mongoose");
const Party = require("../models/Party");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const AppError = require("../utils/AppError");

const resolveParty = async (req) => {
  let partyId = req.user?.partyId || req.params.partyId;
  // Fallback: pick the first party if none is linked (demo/dev flow)
  if (!partyId) {
    const first = await Party.findOne({}).sort({ createdAt: -1 });
    if (first?._id) {
      partyId = first._id;
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
    const history = party.historicalData || [];

    // If history empty, try aggregate from ended elections
    let aggregated = history;
    if (!history.length) {
      const endedElections = await Election.find({ status: "Ended" }).select("_id title endDate");
      const endedIds = endedElections.map((e) => e._id);
      const voteAgg = await Vote.aggregate([
        { $match: { partyId: { $in: endedIds.length ? [] : [] } } }, // placeholder no data
      ]);
      // Without stored partyId in historical votes we keep history empty
      aggregated = [];
    }

    const pastElections = aggregated.slice(-5).map((item) => ({
      year: item.year,
      election: item.election || item.title || item.year,
      votes: item.votes || 0,
      position: item.position || null,
      totalParties: item.totalParties || null,
    }));

    const totalWins = aggregated.filter((h) => h.position === 1 || h.won).length;
    const averageVotes =
      aggregated.length > 0
        ? Math.round(
            aggregated.reduce((acc, cur) => acc + (cur.votes || 0), 0) / aggregated.length,
          )
        : 0;
    const winRate =
      aggregated.length > 0 ? `${((totalWins / aggregated.length) * 100).toFixed(1)}%` : "0%";

    res.json({
      data: {
        pastElections,
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

    const totalVotes = voteAgg.reduce((acc, cur) => acc + cur.votes, 0);

    const partiesWithNames = await Promise.all(
      voteAgg.map(async (row) => {
        const p = await Party.findById(row._id).lean();
        return {
          partyId: row._id,
          name: p?.name || "Unknown",
          logo: p?.logo || p?.symbol,
          votes: row.votes,
        };
      }),
    );

    const sorted = partiesWithNames.sort((a, b) => b.votes - a.votes);
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
          title: election.title,
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
          development: party.development ?? party.goodWorkPercent ?? 0,
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
