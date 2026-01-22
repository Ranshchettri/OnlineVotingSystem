const Vote = require("../models/Vote");

const castVote = async (req, res) => {
  try {
    const vote = new Vote(req.body);
    await vote.save();
    res.status(201).json(vote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVotes = async (req, res) => {
  try {
    const votes = await Vote.find().populate("userId candidateId electionId");
    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { castVote, getVotes };
