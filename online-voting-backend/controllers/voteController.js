const Vote = require("../models/Vote");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const AppError = require("../utils/AppError");

// POST /api/votes
const castVote = async (req, res, next) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user._id; // from authMiddleware

    // 1 Check election exists
    const election = await Election.findById(electionId);
    if (!election) return next(new AppError("Election not found", 404));

    // 2 Check election is active
    if (!election.isActive)
      return next(new AppError("Election is not active", 400));

    // 3 Check election dates
    const now = new Date();
    if (now < new Date(election.startDate) || now > new Date(election.endDate))
      return next(
        new AppError("Voting not allowed outside election period", 400),
      );

    // 4 Check user already voted
    const existingVote = await Vote.findOne({ userId, electionId });
    if (existingVote)
      return next(new AppError("You have already voted in this election", 400));

    // 5 Check candidate exists in this election
    const candidate = await Candidate.findOne({ _id: candidateId, electionId });
    if (!candidate)
      return next(new AppError("Candidate not found in this election", 404));

    // 6 Cast vote
    const vote = await Vote.create({
      userId,
      electionId,
      candidateId,
      createdAt: new Date(),
      transactionHash: "", // blockchain integration later
    });

    res.status(201).json({
      status: "success",
      message: "Vote cast successfully",
      data: vote,
    });
  } catch (err) {
    next(err);
  }
};

const getVotes = async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate("userId", "fullName email voterIdNumber")
      .populate("candidateId", "fullName partyName")
      .populate("electionId", "title type")
      .sort({ createdAt: -1 });

    // Group votes by election for better admin view
    const votesByElection = votes.reduce((acc, vote) => {
      const electionId = vote.electionId._id.toString();
      if (!acc[electionId]) {
        acc[electionId] = {
          election: vote.electionId,
          votes: [],
        };
      }
      acc[electionId].votes.push({
        id: vote._id,
        voter: vote.userId,
        candidate: vote.candidateId,
        timestamp: vote.createdAt,
      });
      return acc;
    }, {});

    res.json({
      totalVotes: votes.length,
      votesByElection: Object.values(votesByElection),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { castVote, getVotes };
