const Election = require("../models/Election");
const User = require("../models/User");
const sendEmail = require("../utils/email");
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
    const { title, type, startDate, endDate } = req.body;

    // Basic validation
    if (!title || !type || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["political", "student"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Election type must be 'political' or 'student'" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    const now = new Date();
    const election = new Election({
      title,
      type,
      startDate: start,
      endDate: end,
      status: start <= now && end >= now ? "Running" : "Upcoming",
      isActive: start <= now && end >= now,
      allowVoting: true,
      isEnded: false,
    });

    await election.save();
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
