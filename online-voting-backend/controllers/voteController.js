const Vote = require("../models/Vote");
const Election = require("../models/Election");

const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user._id;

    // 1 Check if user is verified
    if (!req.user.verified) {
      return res
        .status(403)
        .json({ message: "User not verified. Cannot vote." });
    }

    // 2 Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (!election.isActive) {
      return res.status(403).json({ message: "Election is not active" });
    }

    // 3 Check election eligibility (student vs political)
    if (election.type === "student" && !req.user.isStudent) {
      return res
        .status(403)
        .json({ message: "Only students can vote in student elections" });
    }

    // 4 Check if user already voted in this election (DB index will prevent duplicate, but let's check explicitly)
    const existingVote = await Vote.findOne({ userId, electionId });
    if (existingVote) {
      return res
        .status(409)
        .json({ message: "You have already voted in this election" });
    }

    // 5 Create and save the vote
    const vote = new Vote({
      userId,
      electionId,
      candidateId,
    });

    await vote.save();

    res.status(201).json({
      message: "Vote cast successfully",
      vote: {
        id: vote._id,
        userId: vote.userId,
        electionId: vote.electionId,
        candidateId: vote.candidateId,
        createdAt: vote.createdAt,
      },
    });
  } catch (error) {
    // Handle duplicate key error from DB index
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "You have already voted in this election" });
    }
    res.status(500).json({ error: error.message });
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
