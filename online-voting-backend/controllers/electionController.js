const mongoose = require("mongoose");
const Election = require("../models/Election");
const User = require("../models/User");
const Party = require("../models/Party");
const Activity = require("../models/Activity");
const sendEmail = require("../utils/email");
const { writeAuditLog } = require("../utils/audit");
const {
  notifyElectionToParties,
  notifyElectionOutcomeToParties,
  ensureElectionAnalyticsSnapshot,
  finalizeElectionAnalyticsSnapshot,
} = require("../utils/electionPartyNotifications");

const deriveElectionState = (election, now = new Date()) => {
  const start = election.startDate ? new Date(election.startDate) : null;
  const end = election.endDate ? new Date(election.endDate) : null;
  const raw = String(election.status || "").toLowerCase();

  if (raw === "ended" || election.isEnded) {
    return { status: "Ended", isActive: false, isEnded: true, allowVoting: false };
  }

  if (start && now < start) {
    return {
      status: "Upcoming",
      isActive: false,
      isEnded: false,
      allowVoting: election.allowVoting !== false,
    };
  }

  if (end && now > end) {
    return { status: "Ended", isActive: false, isEnded: true, allowVoting: false };
  }

  if (start && end && now >= start && now <= end) {
    const canVote = election.allowVoting !== false;
    return {
      status: canVote ? "Running" : "Ended",
      isActive: canVote,
      isEnded: !canVote,
      allowVoting: canVote,
    };
  }

  return {
    status: election.status || "Upcoming",
    isActive: Boolean(election.isActive),
    isEnded: Boolean(election.isEnded),
    allowVoting: election.allowVoting !== false,
  };
};

const createActivity = async ({ action, user, userId, icon, color }) => {
  try {
    await Activity.create({
      action,
      user,
      userId: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined,
      icon: icon || "ri-information-line",
      color: color || "blue",
    });
  } catch (error) {
    console.error("Failed to create activity:", error.message);
  }
};

const syncElectionState = async (election, now = new Date()) => {
  const previousStatus = String(election.status || "").toLowerCase();
  const derived = deriveElectionState(election, now);
  const changed =
    election.status !== derived.status ||
    election.isActive !== derived.isActive ||
    election.isEnded !== derived.isEnded ||
    election.allowVoting !== derived.allowVoting;

  if (changed) {
    election.status = derived.status;
    election.isActive = derived.isActive;
    election.isEnded = derived.isEnded;
    election.allowVoting = derived.allowVoting;
    await election.save();

    const nextStatus = String(derived.status || "").toLowerCase();
    if (previousStatus !== "running" && nextStatus === "running") {
      await ensureElectionAnalyticsSnapshot(election);
      await notifyElectionToParties(election, {
        type: "success",
        title: "Election started",
        message: `${election.title} is now running. Live voting has started.`,
      }, { includeActiveFallback: true });
    } else if (previousStatus !== "ended" && nextStatus === "ended") {
      await finalizeElectionAnalyticsSnapshot(election);
      await notifyElectionToParties(election, {
        type: "warning",
        title: "Election ended",
        message: `${election.title} has ended. Results will be published soon.`,
      }, { includeActiveFallback: true });
      await notifyElectionOutcomeToParties(election);
    }
  }

  return election;
};

const createElection = async (req, res) => {
  try {
    const {
      title,
      type,
      startDate,
      endDate,
      participatingParties = [],
      totalSeats,
      electionSystem,
      prMethod,
      partyThresholdPercent,
    } = req.body;

    // Basic validation
    if (!title || !type || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedType = String(type || "").toLowerCase();
    const validTypes = ["political", "student", "local", "provincial", "national"];
    if (!validTypes.includes(normalizedType)) {
      return res
        .status(400)
        .json({ message: "Election type must be political, student, local, provincial, or national" });
    }

    const normalizedSystem = String(electionSystem || "FPTP").toUpperCase();
    const system =
      normalizedSystem === "PR"
        ? "PR"
        : normalizedSystem === "HYBRID"
          ? "Hybrid"
          : "FPTP";
    const normalizedPrMethod = String(prMethod || "DHONDT").toUpperCase();
    const method =
      normalizedPrMethod === "SIMPLE"
        ? "SIMPLE"
        : normalizedPrMethod === "SAINTE_LAGUE"
          ? "SAINTE_LAGUE"
          : "DHONDT";
    const seats = Number.isFinite(Number(totalSeats))
      ? Math.max(1, Math.floor(Number(totalSeats)))
      : 100;
    const threshold = Number.isFinite(Number(partyThresholdPercent))
      ? Math.min(100, Math.max(0, Number(partyThresholdPercent)))
      : 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    const now = new Date();
    const typeRegex = new RegExp(`^${String(normalizedType).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    const fallbackParties =
      Array.isArray(participatingParties) && participatingParties.length > 0
        ? participatingParties
        : (
            await Party.find({
              status: "approved",
              isActive: true,
              electionType: typeRegex,
            })
              .select("_id")
              .lean()
          ).map((party) => party._id.toString());
    const uniquePartyIds = [...new Set(fallbackParties.map((id) => String(id || "")).filter(Boolean))];

    const election = new Election({
      title,
      type: normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1),
      electionSystem: system,
      totalSeats: seats,
      prMethod: method,
      partyThresholdPercent: threshold,
      startDate: start,
      endDate: end,
      status: start <= now && end >= now ? "Running" : "Upcoming",
      isActive: start <= now && end >= now,
      allowVoting: true,
      isEnded: false,
      participatingParties: uniquePartyIds.map((partyId) => ({
        partyId,
        votes: 0,
        percentage: 0,
        seats: 0,
      })),
    });

    await election.save();
    if (String(election.status || "").toLowerCase() === "running") {
      await ensureElectionAnalyticsSnapshot(election);
    }
    await createActivity({
      action: `Election created: ${election.title} (${election.electionSystem})`,
      user: req.user?.fullName || "Admin",
      userId: req.user?._id,
      icon: "ri-ballot-line",
      color: "blue",
    });
    await writeAuditLog({
      action: "ELECTION_CREATED",
      userId: req.user?._id,
      userRole: req.user?.role || "admin",
      req,
      metadata: {
        electionId: election._id,
        title: election.title,
        electionSystem: election.electionSystem,
        totalSeats: election.totalSeats,
      },
    });
    await notifyElectionToParties(election, {
      type: "info",
      title: "New election created",
      message:
        election.status === "Running"
          ? `${election.title} is now running.`
          : `${election.title} has been scheduled and will start on ${start.toLocaleString()}.`,
    }, { includeActiveFallback: true });

    // Send email notification to all verified voters
    const users = await User.find({ verified: true });
    for (const user of users) {
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `New Election Started: ${election.title}`,
          html: `
            <h3>Hello ${user.fullName},</h3>
            <p>A new election "${election.title}" is now active!</p>
            <p>Start: ${election.startDate}</p>
            <p>End: ${election.endDate}</p>
            <p>Visit your dashboard to vote.</p>
          `,
        });
      }
    }

    res.status(201).json({
      message: "Election created successfully",
      election,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    const now = new Date();
    await Promise.all(elections.map((election) => syncElectionState(election, now)));
    res.json(elections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveElections = async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find().sort({ createdAt: -1 });
    await Promise.all(elections.map((election) => syncElectionState(election, now)));
    const active = elections.filter((election) => election.status === "Running");
    res.json(active);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleElectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const now = new Date();
    const previousStatus = String(election.status || "").toLowerCase();
    if (election.isActive) {
      election.isActive = false;
      election.allowVoting = false;
      election.isEnded = true;
      election.status = "Ended";
    } else if (new Date(election.endDate) < now) {
      return res.status(400).json({ message: "Cannot activate an ended election" });
    } else {
      election.isActive = true;
      election.allowVoting = true;
      election.isEnded = false;
      election.status = "Running";
    }
    await election.save();
    await createActivity({
      action: `Election ${election.isActive ? "activated" : "ended"}: ${election.title}`,
      user: req.user?.fullName || "Admin",
      userId: req.user?._id,
      icon: election.isActive ? "ri-play-circle-line" : "ri-stop-circle-line",
      color: election.isActive ? "green" : "red",
    });
    const nextStatus = String(election.status || "").toLowerCase();
    if (previousStatus !== "running" && nextStatus === "running") {
      await ensureElectionAnalyticsSnapshot(election);
    } else if (previousStatus !== "ended" && nextStatus === "ended") {
      await finalizeElectionAnalyticsSnapshot(election);
      await notifyElectionOutcomeToParties(election);
    }

    await notifyElectionToParties(election, {
      type: election.status === "Running" ? "success" : "warning",
      title:
        election.status === "Running"
          ? "Election activated"
          : "Election ended",
      message:
        election.status === "Running"
          ? `${election.title} is now running.`
          : `${election.title} has ended. Results will be published soon.`,
    }, { includeActiveFallback: true });

    res.json({
      message: `Election ${election.isActive ? "activated" : "deactivated"} successfully`,
      election,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createElection,
  getElections,
  getActiveElections,
  toggleElectionStatus,
  syncElectionState,
};
