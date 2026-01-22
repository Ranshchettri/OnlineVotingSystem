const Election = require("../models/Election");

const createElection = async (req, res) => {
  try {
    const election = new Election(req.body);
    await election.save();
    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getElections = async (req, res) => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createElection, getElections };
