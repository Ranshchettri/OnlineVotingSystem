const Vote = require("../models/Vote");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const AppError = require("../utils/AppError");

// Calculate results with tie handling
const calculateResults = async (req, res, next) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) return next(new AppError("Election not found", 404));
    if (election.isEnded)
      return next(new AppError("Election already ended", 400));

    // Aggregate votes per candidate
    const votes = await Vote.aggregate([
      { $match: { electionId: election._id } },
      { $group: { _id: "$candidateId", totalVotes: { $sum: 1 } } },
      { $sort: { totalVotes: -1 } },
    ]);

    // No votes yet
    if (!votes.length) {
      election.results = [];
      election.winnerIds = [];
      election.isEnded = true;
      await election.save();
      return res.status(200).json({
        status: "success",
        message: "Election ended with no votes yet",
        data: election,
      });
    }

    // Find max votes
    const maxVotes = votes[0].totalVotes;
    const winnerIds = votes
      .filter((v) => v.totalVotes === maxVotes)
      .map((v) => v._id);

    // Save results
    election.results = votes.map((v) => ({
      candidateId: v._id,
      totalVotes: v.totalVotes,
    }));
    election.winnerIds = winnerIds;
    election.isEnded = true;
    await election.save();

    const populatedResults = await Election.findById(electionId)
      .populate("results.candidateId", "fullName partyName profileImage")
      .populate("winnerIds", "fullName partyName profileImage");

    res.status(200).json({
      status: "success",
      data: populatedResults,
    });
  } catch (err) {
    next(err);
  }
};

// Voter-facing read-only results
const getResults = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.electionId)
      .populate("results.candidateId", "fullName partyName profileImage")
      .populate("winnerIds", "fullName partyName profileImage");

    if (!election) return next(new AppError("Election not found", 404));
    if (!election.isEnded)
      return next(new AppError("Results not available yet", 400));

    res.status(200).json({
      status: "success",
      data: election,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { calculateResults, getResults };
