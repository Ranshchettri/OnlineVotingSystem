const Vote = require("../models/Vote");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const Party = require("../models/Party");
const AppError = require("../utils/AppError");

// POST /api/votes
const castVote = async (req, res, next) => {
  try {
    const { electionId, candidateId, partyId } = req.body;
    const userId = req.user._id; // from authMiddleware
    const role = req.user?.role;

    if (role !== "voter") {
      return next(new AppError("Only voter accounts can cast votes", 403));
    }

    // 1 Check election exists
    const election = await Election.findById(electionId);
    if (!election) return next(new AppError("Election not found", 404));

    // 2 Check election dates and runtime state
    const now = new Date();
    const start = election.startDate ? new Date(election.startDate) : null;
    const end = election.endDate ? new Date(election.endDate) : null;

    if (start && now < start) {
      return next(new AppError("Election has not started yet", 400));
    }

    if (end && now > end) {
      if (election.status !== "Ended" || election.isActive || !election.isEnded) {
        election.status = "Ended";
        election.isActive = false;
        election.isEnded = true;
        election.allowVoting = false;
        await election.save();
      }
      return next(
        new AppError("Voting not allowed outside election period", 400),
      );
    }

    if (
      election.allowVoting === false ||
      String(election.status || "").toLowerCase() === "ended"
    ) {
      return next(new AppError("Election voting is closed", 400));
    }

    if (
      !election.isActive ||
      String(election.status || "").toLowerCase() !== "running"
    ) {
      election.isActive = true;
      election.isEnded = false;
      election.status = "Running";
      election.allowVoting = true;
      await election.save();
    }

    // 3 Check user already voted
    const existingVote = await Vote.findOne({ userId, electionId });
    if (existingVote)
      return next(new AppError("You have already voted in this election", 400));

    // 4 Validate either candidate or party vote
    let candidate = null;
    let party = null;
    if (candidateId) {
      candidate = await Candidate.findOne({ _id: candidateId, electionId });
      if (!candidate)
        return next(new AppError("Candidate not found in this election", 404));
    } else if (partyId) {
      party = await Party.findById(partyId);
      if (!party) return next(new AppError("Party not found", 404));
    } else {
      return next(new AppError("candidateId or partyId is required", 400));
    }

    // 5 Cast vote
    const vote = await Vote.create({
      userId,
      electionId,
      candidateId,
      partyId,
      createdAt: new Date(),
      transactionHash: "", // blockchain integration later
    });

    // Update election + party stats (best-effort, non-blocking)
    try {
      await Election.findByIdAndUpdate(electionId, {
        $inc: { totalVotes: 1 },
      });
      if (partyId) {
        await Party.findByIdAndUpdate(partyId, { $inc: { currentVotes: 1 } });
      }
    } catch (err) {
      console.error("Failed to update vote counters", err.message);
    }

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

// GET /api/votes/me (voter history)
const getMyVotes = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "No token, access denied" });

    const votes = await Vote.find({ userId })
      .populate("partyId", "name")
      .populate("electionId", "title")
      .sort({ createdAt: -1 });

    const formatted = votes.map((v) => ({
      _id: v._id,
      electionId: v.electionId?._id,
      electionName: v.electionId?.title,
      partyId: v.partyId?._id,
      partyName: v.partyId?.name,
      createdAt: v.createdAt,
    }));

    res.json({ data: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { castVote, getVotes, getMyVotes };
