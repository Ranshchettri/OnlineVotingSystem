const Candidate = require("../models/Candidate");

const createCandidate = async (req, res) => {
  try {
    const { fullName, partyName, electionId } = req.body;

    // Basic validation
    if (!fullName || !electionId) {
      return res
        .status(400)
        .json({ message: "Full name and election ID are required" });
    }

    // Check if election exists
    const Election = require("../models/Election");
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const candidate = new Candidate({
      fullName,
      partyName, // Optional for student elections
      electionId,
    });

    await candidate.save();

    res.status(201).json({
      message: "Candidate added successfully",
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
