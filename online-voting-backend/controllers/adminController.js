const mongoose = require("mongoose");
const User = require("../models/User");
const Vote = require("../models/Vote");
const Party = require("../models/Party");
const Election = require("../models/Election");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const Analytics = require("../models/Analytics");
const AppError = require("../utils/AppError");

// Utility: create activity log (non-blocking)
const logActivity = async ({ action, user, userId, icon, color }) => {
  try {
    await Activity.create({
      action,
      user,
      userId,
      icon,
      color,
    });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};

// Utility: create audit log (non-blocking)
const logAudit = async (req, action, metadata = {}) => {
  try {
    await AuditLog.create({
      action,
      userId: req.user?._id,
      userRole: req.user?.role,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      location: metadata.location,
      metadata,
    });
  } catch (err) {
    console.error("Failed to log audit:", err.message);
  }
};

// GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalVoters, activeVoters, totalParties, activeParties, pendingParties] =
      await Promise.all([
        User.countDocuments({ role: "voter" }),
        User.countDocuments({ role: "voter", isVerified: true }),
        Party.countDocuments({}),
        Party.countDocuments({ isActive: true }),
        Party.countDocuments({ status: "pending" }),
      ]);

    const currentElection =
      (await Election.findOne({ status: "Running" }).sort({ startDate: -1 })) ||
      (await Election.findOne({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      }).sort({ startDate: -1 }));

    let currentElectionVotes = 0;
    if (currentElection?._id) {
      currentElectionVotes = await Vote.countDocuments({
        electionId: currentElection._id,
      });
    }

    const votedPercentage =
      totalVoters > 0 ? Number(((currentElectionVotes / totalVoters) * 100).toFixed(2)) : 0;

    const pendingVoters = await User.countDocuments({
      role: "voter",
      $or: [{ isVerified: false }, { verificationStatus: "pending" }],
    });

    res.status(200).json({
      data: {
        totalVoters,
        activeVoters,
        votedPercentage,
        totalParties,
        activeParties,
        pendingApprovals: pendingParties + pendingVoters,
        currentElection: currentElection
          ? {
              id: currentElection._id,
              title: currentElection.title,
              status: currentElection.status || (currentElection.isActive ? "Running" : "Upcoming"),
              totalVotes: currentElectionVotes,
              turnout: currentElection.turnout || votedPercentage,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/dashboard/live-votes/:electionId
const getLiveVotes = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return next(new AppError("Election not found", 404));

    const grouped = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      {
        $group: {
          _id: "$partyId",
          votes: { $sum: 1 },
        },
      },
      { $sort: { votes: -1 } },
      {
        $lookup: {
          from: "parties",
          localField: "_id",
          foreignField: "_id",
          as: "party",
        },
      },
      { $unwind: { path: "$party", preserveNullAndEmptyArrays: true } },
    ]);

    const totalVotes = grouped.reduce((acc, cur) => acc + cur.votes, 0);

    const parties = grouped.map((item) => ({
      partyId: item._id,
      name: item.party?.name || "Unknown Party",
      logo: item.party?.logo || item.party?.symbol || "",
      votes: item.votes,
      percentage: totalVotes ? Number(((item.votes / totalVotes) * 100).toFixed(2)) : 0,
      color: item.party?.color || "#dc2626",
    }));

    res.status(200).json({
      data: {
        election: {
          id: election._id,
          title: election.title,
          status: election.status,
        },
        parties,
        totalVotes,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/dashboard/activities
const getActivities = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);

    const [activities, total] = await Promise.all([
      Activity.find({})
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      Activity.countDocuments({}),
    ]);

    res.status(200).json({
      data: activities.map((a) => ({
        action: a.action,
        user: a.user,
        time: a.createdAt,
        icon: a.icon,
        color: a.color,
      })),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/elections
const listElections = async (req, res, next) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 }).lean();

    const voteAgg = await Vote.aggregate([
      {
        $group: {
          _id: { electionId: "$electionId", partyId: "$partyId" },
          votes: { $sum: 1 },
        },
      },
    ]);

    const groupedByElection = voteAgg.reduce((acc, item) => {
      const id = item._id.electionId?.toString();
      if (!id) return acc;
      if (!acc[id]) acc[id] = [];
      acc[id].push(item);
      return acc;
    }, {});

    const formatted = await Promise.all(
      elections.map(async (e) => {
        const partyVotes = groupedByElection[e._id.toString()] || [];
        const totalVotes = partyVotes.reduce((acc, cur) => acc + cur.votes, 0);

        const parties = await Promise.all(
          partyVotes.map(async (pv) => {
            const party = await Party.findById(pv._id.partyId).lean();
            const percentage = totalVotes
              ? `${((pv.votes / totalVotes) * 100).toFixed(2)}%`
              : "0%";
            return {
              name: party?.name || "Unknown",
              votes: pv.votes,
              percentage,
            };
          }),
        );

        return {
          id: e._id,
          title: e.title,
          type: e.type,
          status: e.status || (e.isActive ? "Running" : e.isEnded ? "Ended" : "Upcoming"),
          startDate: e.startDate,
          endDate: e.endDate,
          totalVotes,
          turnout: e.turnout || 0,
          parties,
        };
      }),
    );

    res.status(200).json({ data: { elections: formatted } });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/elections
const createElection = async (req, res, next) => {
  try {
    const { title, type, startDate, endDate, participatingParties = [] } = req.body;

    if (!title || !type || !startDate || !endDate) {
      return next(new AppError("title, type, startDate and endDate are required", 400));
    }

    const election = await Election.create({
      title,
      type,
      startDate,
      endDate,
      status: new Date(startDate) <= new Date() ? "Running" : "Upcoming",
      participatingParties: participatingParties.map((pid) => ({
        partyId: pid,
        votes: 0,
        percentage: 0,
      })),
      isActive: new Date(startDate) <= new Date(),
      allowVoting: true,
    });

    await logActivity({
      action: `Election created: ${title}`,
      user: req.user?.fullName,
      userId: req.user?._id,
      icon: "ri-ballot-line",
      color: "blue",
    });

    res.status(201).json({ success: true, electionId: election._id });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/elections/:id/stop
const stopElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);
    if (!election) return next(new AppError("Election not found", 404));

    election.status = "Ended";
    election.isActive = false;
    election.allowVoting = false;
    election.endDate = election.endDate || new Date();
    await election.save();

    await logActivity({
      action: `Election ended: ${election.title}`,
      user: req.user?.fullName,
      userId: req.user?._id,
      icon: "ri-stop-circle-line",
      color: "red",
    });

    res.json({ success: true, message: "Election stopped" });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/voters
const getVoters = async (req, res, next) => {
  try {
    const { search, status = "all" } = req.query;
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);

    const filter = { role: "voter" };
    if (status === "verified") filter.isVerified = true;
    if (status === "pending") filter.isVerified = false;

    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { mobile: new RegExp(search, "i") },
        { voterId: new RegExp(search, "i") },
        { voterIdNumber: new RegExp(search, "i") },
      ];
    }

    const [voters, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const mapped = voters.map((v) => ({
      id: v._id,
      voterId: v.voterId || v.voterIdNumber,
      fullName: v.fullName,
      email: v.email,
      mobile: v.mobile,
      isVerified: v.isVerified || v.verified,
      hasVoted: v.hasVoted || false,
      status: v.isVerified || v.verified ? "ACTIVE" : "PENDING",
      createdAt: v.createdAt,
    }));

    res.status(200).json({ data: { voters: mapped, total } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/voters/:id/verify
const verifyVoter = async (req, res, next) => {
  try {
    const voterId = req.params.id;
    const voter = await User.findById(voterId);
    if (!voter) return next(new AppError("Voter not found", 404));

    voter.isVerified = true;
    voter.verified = true;
    voter.verificationStatus = "auto-approved";
    await voter.save();

    await logActivity({
      action: `Voter approved: ${voter.fullName}`,
      user: req.user?.fullName,
      userId: req.user?._id,
      icon: "ri-user-check-line",
      color: "green",
    });

    res.json({ success: true, message: "Voter verified" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/voters/:id
const deleteVoter = async (req, res, next) => {
  try {
    const voterId = req.params.id;
    const voter = await User.findByIdAndDelete(voterId);
    if (!voter) return next(new AppError("Voter not found", 404));
    res.json({ success: true, message: "Voter deleted" });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/party/:id/activate
const activateParty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const party = await Party.findById(id);
    if (!party) return next(new AppError("Party not found", 404));
    party.isActive = true;
    party.status = "approved";
    party.isVerified = true;
    await party.save();

    await logActivity({
      action: `Party activated: ${party.name}`,
      user: req.user?.fullName,
      userId: req.user?._id,
      icon: "ri-shield-check-line",
      color: "blue",
    });

    res.json({ success: true, message: "Party activated" });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/analytics/party/:partyId/detailed
const getPartyAnalyticsDetailed = async (req, res, next) => {
  try {
    const { partyId } = req.params;
    const party = await Party.findById(partyId).lean();
    if (!party) return next(new AppError("Party not found", 404));

    res.json({
      data: {
        party: { name: party.name, logo: party.logo || party.symbol },
        overallScores: {
          development: party.development || party.goodWorkPercent || 0,
          goodWork: party.goodWork || party.goodWorkPercent || 0,
          badWork: party.badWork || party.badWorkPercent || 0,
        },
        detailedMetrics: party.detailedMetrics || {},
        historicalData: party.historicalData || [],
        lastUpdated: party.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/analytics/party/:partyId/update
const updatePartyAnalyticsDetailed = async (req, res, next) => {
  try {
    const { partyId } = req.params;
    const {
      development,
      goodWork,
      badWork,
      detailedMetrics = {},
      year,
      votes,
    } = req.body;

    const party = await Party.findById(partyId);
    if (!party) return next(new AppError("Party not found", 404));

    if (development !== undefined) party.development = development;
    if (goodWork !== undefined) party.goodWork = goodWork;
    if (badWork !== undefined) party.badWork = badWork;

    party.detailedMetrics = {
      ...party.detailedMetrics,
      ...detailedMetrics,
    };

    if (year) {
      party.historicalData = party.historicalData || [];
      party.historicalData.push({
        year,
        development: development ?? party.development,
        goodWork: goodWork ?? party.goodWork,
        badWork: badWork ?? party.badWork,
        votes,
      });
    }

    await party.save();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/notifications/create
const createNotification = async (req, res, next) => {
  try {
    const { userId, type = "info", title, message } = req.body;
    if (!userId) return next(new AppError("userId is required", 400));

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
    });

    res.status(201).json({ success: true, notificationId: notification._id });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/notifications/broadcast
const broadcastNotification = async (req, res, next) => {
  try {
    const { role = "all", type = "info", title, message } = req.body;
    if (!title || !message) return next(new AppError("title and message required", 400));

    const userFilter = role === "all" ? {} : { role };
    const users = await User.find(userFilter).select("_id").lean();

    const payload = users.map((u) => ({
      userId: u._id,
      type,
      title,
      message,
    }));

    if (payload.length) {
      await Notification.insertMany(payload);
    }

    res.json({ success: true, sentCount: payload.length });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/live-tracking/:electionId
const getLiveTracking = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return next(new AppError("Election not found", 404));

    // votes per minute (last 10 minutes)
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const recentVotes = await Vote.find({
      electionId,
      createdAt: { $gte: tenMinutesAgo },
    }).lean();

    const votesPerMinute = recentVotes.length / 10;

    const partyAgg = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      { $group: { _id: "$partyId", votes: { $sum: 1 } } },
      { $sort: { votes: -1 } },
    ]);

    const totalVotes = partyAgg.reduce((acc, cur) => acc + cur.votes, 0);

    const partyWiseVotes = await Promise.all(
      partyAgg.map(async (item, idx) => {
        const party = await Party.findById(item._id).lean();
        return {
          partyId: item._id,
          name: party?.name || "Unknown",
          votes: item.votes,
          percentage: totalVotes ? Number(((item.votes / totalVotes) * 100).toFixed(2)) : 0,
          trend: idx === 0 ? "up" : "stable",
        };
      }),
    );

    res.json({
      data: {
        election: { name: election.title, status: election.status },
        liveData: {
          totalVotes,
          votesPerMinute: Number(votesPerMinute.toFixed(2)),
          peakVotingTime: election.startDate,
          currentTurnout:
            election.totalVoters > 0
              ? Number(((totalVotes / election.totalVoters) * 100).toFixed(2))
              : 0,
        },
        partyWiseVotes,
        regionWiseVotes: [],
        ageGroupVotes: [],
        genderWiseVotes: { male: 0, female: 0, other: 0 },
        votesOverTime: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { userId, action, startDate, endDate, limit = 50, offset = 0 } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      data: {
        logs: logs.map((l) => ({
          action: l.action,
          user: l.userId,
          role: l.userRole,
          ipAddress: l.ipAddress,
          location: l.location,
          timestamp: l.timestamp,
        })),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getLiveVotes,
  getActivities,
  listElections,
  createElection,
  stopElection,
  getVoters,
  verifyVoter,
  deleteVoter,
  activateParty,
  getPartyAnalyticsDetailed,
  updatePartyAnalyticsDetailed,
  createNotification,
  broadcastNotification,
  getLiveTracking,
  getAuditLogs,
  logAudit,
};
