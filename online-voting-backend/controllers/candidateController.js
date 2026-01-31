const Candidate = require("../models/Candidate");

const createCandidate = async (req, res) => {
  try {
    const { fullName, partyName, electionId } = req.body;
    const userId = req.user._id;

    // Basic validation
    if (!fullName || !electionId) {
      return res
        .status(400)
        .json({ message: "Full name and election ID are required" });
    }

    // Check if user is verified
    if (!req.user.verified) {
      return res
        .status(403)
        .json({ message: "User not verified. Cannot register as candidate." });
    }

    // Check if election exists
    const Election = require("../models/Election");
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Check if user already candidate in this election
    const existingCandidate = await Candidate.findOne({ userId, electionId });
    if (existingCandidate) {
      return res
        .status(409)
        .json({ message: "You are already a candidate in this election" });
    }

    const candidate = new Candidate({
      userId,
      fullName,
      partyName, // Optional for student elections
      electionId,
    });

    await candidate.save();

    res.status(201).json({
      message: "Candidate registered successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().populate("electionId");
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createCandidate, getCandidates };
