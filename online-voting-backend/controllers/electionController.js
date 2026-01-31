const Election = require("../models/Election");
const User = require("../models/User");
const sendEmail = require("../utils/email");

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

    if (start <= new Date()) {
      return res
        .status(400)
        .json({ message: "Start date must be in the future" });
    }

    const election = new Election({
      title,
      type,
      startDate: start,
      endDate: end,
      isActive: false, // Admin can activate later
    });

    await election.save();

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
    res.json(elections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveElections = async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });
    res.json(elections);
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

    election.isActive = !election.isActive;
    await election.save();

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
};
