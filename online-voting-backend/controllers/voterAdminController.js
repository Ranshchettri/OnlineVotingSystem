const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { logAudit } = require("./adminController");

const buildStats = (voters = []) => {
  const totalRegistered = voters.length;
  const activeVoters = voters.filter((v) => v.isVerified || v.verified).length;
  const inactiveVoters = voters.filter((v) => !(v.isVerified || v.verified)).length;
  const now = Date.now();
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;
  const newRegistered = voters.filter((v) => {
    const created = v.createdAt ? new Date(v.createdAt).getTime() : 0;
    return now - created <= thirtyDays;
  }).length;
  const percentageChange = totalRegistered ? (newRegistered / totalRegistered) * 100 : 0;
  return {
    totalRegistered,
    activeVoters,
    inactiveVoters,
    newRegistered,
    percentageChange,
  };
};

// GET /api/voters/admin/stats
const getVoterStats = async (req, res, next) => {
  try {
    const voters = await User.find({ role: "voter" }).sort({ createdAt: -1 }).lean();
    const stats = buildStats(voters);

    const formatted = voters.map((v) => ({
      _id: v._id,
      fullName: v.fullName,
      voterId: v.voterId || v.voterIdNumber,
      email: v.email,
      mobile: v.mobile,
      photoUrl: v.profilePhoto,
      status: v.isVerified || v.verified ? (v.verificationStatus === "blocked" ? "BLOCKED" : "ACTIVE") : "PENDING",
      voted: v.hasVoted || false,
      createdAt: v.createdAt,
    }));

    res.json({ data: { stats, voters: formatted } });
  } catch (error) {
    console.error("createVoter failed", error);
    if (error.code === 11000) {
      return next(new AppError("Voter already exists with same email or ID", 409));
    }
    next(error);
  }
};

// POST /api/voters/admin/:id/approve
const approveVoter = async (req, res, next) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) return next(new AppError("Voter not found", 404));
    voter.isVerified = true;
    voter.verified = true;
    voter.verificationStatus = "auto-approved";
    await voter.save();
    await logAudit(req, "approve_voter", { voterId: voter._id });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// POST /api/voters/admin/:id/block
const blockVoter = async (req, res, next) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) return next(new AppError("Voter not found", 404));
    voter.isVerified = false;
    voter.verified = false;
    voter.verificationStatus = "blocked";
    await voter.save();
    await logAudit(req, "block_voter", { voterId: voter._id });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// POST /api/voters/admin/:id/reject
const rejectVoter = async (req, res, next) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) return next(new AppError("Voter not found", 404));
    voter.isVerified = false;
    voter.verified = false;
    voter.verificationStatus = "rejected";
    await voter.save();
    await logAudit(req, "reject_voter", { voterId: voter._id });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// POST /api/voters/admin
const createVoter = async (req, res, next) => {
  try {
    const { fullName, email, mobile, voterId, voterIdNumber, photo } = req.body;
    if (!fullName || !email) {
      return next(new AppError("fullName and email are required", 400));
    }
    // duplicate guard
    const existing = await User.findOne({
      $or: [{ email }, { voterId }, { voterIdNumber }],
      role: "voter",
    });
    if (existing) {
      return next(new AppError("Voter already exists with same email or ID", 409));
    }
    const hashedPassword = await bcrypt.hash(req.body.password || email, 10);

    const newVoter = await User.create({
      fullName,
      email,
      mobile,
      role: "voter",
      voterId,
      voterIdNumber: voterIdNumber || voterId || `NP${Date.now()}`,
      password: hashedPassword,
      isEmailVerified: true,
      isVerified: true,
      verified: true,
      verificationStatus: "auto-approved",
      profilePhoto: photo || req.body.profilePhoto || null,
    });
    res.status(201).json({ success: true, voterId: newVoter._id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVoterStats,
  approveVoter,
  blockVoter,
  rejectVoter,
  createVoter,
};
