const Candidate = require("../models/Candidate");

const createCandidate = async (req, res) => {
  try {
    const candidate = new Candidate(req.body);
    await candidate.save();
    res.status(201).json(candidate);
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
