const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Activity = require("../models/Activity");
const AppError = require("../utils/AppError");
const { logAudit } = require("./adminController");

const formatVoterStatus = (voter = {}) => {
  const verification = String(voter.verificationStatus || "").toLowerCase();
  if (verification === "blocked" || verification === "rejected") return "BLOCKED";
  if (voter.isVerified || voter.verified || verification === "auto-approved") {
    return "ACTIVE";
  }
  return "PENDING";
};

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

const createActivity = async ({ action, user, userId, icon, color }) => {
  try {
    await Activity.create({
      action,
      user,
      userId: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined,
      icon: icon || "ri-information-line",
      color: color || "blue",
    });
  } catch (error) {
    console.error("Failed to create activity:", error.message);
  }
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
      status: formatVoterStatus(v),
      verificationStatus: v.verificationStatus || "pending",
      voted: v.hasVoted || false,
      hasVoted: v.hasVoted || false,
      dateOfBirth: v.dateOfBirth || null,
      address: v.address || "",
      district: v.district || "",
      province: v.province || "",
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
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
    await createActivity({
      action: `Voter approved: ${voter.fullName}`,
      user: req.user?.fullName || "Admin",
      userId: req.user?._id,
      icon: "ri-user-check-line",
      color: "green",
    });
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
    await createActivity({
      action: `Voter blocked: ${voter.fullName}`,
      user: req.user?.fullName || "Admin",
      userId: req.user?._id,
      icon: "ri-user-forbid-line",
      color: "red",
    });
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
    await createActivity({
      action: `Voter rejected: ${voter.fullName}`,
      user: req.user?.fullName || "Admin",
      userId: req.user?._id,
      icon: "ri-user-unfollow-line",
      color: "red",
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// POST /api/voters/admin
const createVoter = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      mobile,
      voterId,
      voterIdNumber,
      photo,
      dateOfBirth,
      dob,
      address,
      district,
      province,
    } = req.body;
    if (!fullName || !email) {
      return next(new AppError("fullName and email are required", 400));
    }

    const requestedVoterId = voterId || voterIdNumber || "";
    const requestedVoterNumber = voterIdNumber || voterId || "";
    const duplicateFilters = [{ email }];
    if (requestedVoterId) duplicateFilters.push({ voterId: requestedVoterId });
    if (requestedVoterNumber) duplicateFilters.push({ voterIdNumber: requestedVoterNumber });

    // duplicate guard
    const existing = await User.findOne({
      role: "voter",
      $or: duplicateFilters,
    });
    if (existing) {
      return next(new AppError("Voter already exists with same email or ID", 409));
    }
    const hashedPassword = await bcrypt.hash(req.body.password || email, 10);
    const generatedVoterId =
      requestedVoterId || `V${String(Date.now()).slice(-7)}${Math.floor(Math.random() * 10)}`;
    const generatedVoterNumber = requestedVoterNumber || generatedVoterId;
    const resolvedDob = dateOfBirth || dob;

    const newVoter = await User.create({
      fullName,
      email,
      mobile,
      role: "voter",
      voterId: generatedVoterId,
      voterIdNumber: generatedVoterNumber,
      dateOfBirth: resolvedDob ? new Date(resolvedDob) : undefined,
      address: address || "",
      district: district || "",
      province: province || "",
      password: hashedPassword,
      isEmailVerified: true,
      isVerified: true,
      verified: true,
      verificationStatus: "auto-approved",
      profilePhoto: photo || req.body.profilePhoto || null,
    });
    await logAudit(req, "create_voter", { voterId: newVoter._id });
    await createActivity({
      action: `Voter created: ${newVoter.fullName}`,
      user: req.user?.fullName || "Admin",
      userId: req.user?._id,
      icon: "ri-user-add-line",
      color: "blue",
    });
    res.status(201).json({ success: true, voterId: newVoter._id });
  } catch (error) {
    next(error);
  }
};

// PUT /api/voters/admin/:id
const updateVoter = async (req, res, next) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter || voter.role !== "voter") {
      return next(new AppError("Voter not found", 404));
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.role;
    delete updates.password;

    if (updates.email && updates.email !== voter.email) {
      const existingEmail = await User.findOne({
        _id: { $ne: voter._id },
        role: "voter",
        email: updates.email,
      });
      if (existingEmail) {
        return next(new AppError("Email already in use by another voter", 409));
      }
      voter.email = updates.email;
    }

    const incomingVoterId = updates.voterId || updates.voterIdNumber;
    if (incomingVoterId && incomingVoterId !== voter.voterId && incomingVoterId !== voter.voterIdNumber) {
      const existingVoterId = await User.findOne({
        _id: { $ne: voter._id },
        role: "voter",
        $or: [{ voterId: incomingVoterId }, { voterIdNumber: incomingVoterId }],
      });
      if (existingVoterId) {
        return next(new AppError("Voter ID already in use by another voter", 409));
      }
      voter.voterId = incomingVoterId;
      voter.voterIdNumber = incomingVoterId;
    }

    if (updates.fullName !== undefined) voter.fullName = updates.fullName;
    if (updates.mobile !== undefined) voter.mobile = updates.mobile;
    if (updates.address !== undefined) voter.address = updates.address;
    if (updates.district !== undefined) voter.district = updates.district;
    if (updates.province !== undefined) voter.province = updates.province;
    if (updates.photo !== undefined || updates.profilePhoto !== undefined) {
      voter.profilePhoto = updates.photo || updates.profilePhoto || "";
    }
    if (updates.dateOfBirth !== undefined || updates.dob !== undefined) {
      const dob = updates.dateOfBirth || updates.dob;
      voter.dateOfBirth = dob ? new Date(dob) : undefined;
    }

    if (updates.verificationStatus !== undefined) {
      const normalized = String(updates.verificationStatus).toLowerCase();
      if (["active", "approved", "auto-approved"].includes(normalized)) {
        voter.verificationStatus = "auto-approved";
        voter.isVerified = true;
        voter.verified = true;
      } else if (["blocked", "block", "inactive", "rejected"].includes(normalized)) {
        voter.verificationStatus = "blocked";
        voter.isVerified = false;
        voter.verified = false;
      } else if (normalized === "pending") {
        voter.verificationStatus = "pending";
        voter.isVerified = false;
        voter.verified = false;
      }
    } else if (typeof updates.isVerified === "boolean") {
      voter.isVerified = updates.isVerified;
      voter.verified = updates.isVerified;
      voter.verificationStatus = updates.isVerified ? "auto-approved" : "pending";
    }

    await voter.save();
    await logAudit(req, "update_voter", { voterId: voter._id });

    res.status(200).json({
      success: true,
      data: {
        _id: voter._id,
        fullName: voter.fullName,
        voterId: voter.voterId || voter.voterIdNumber,
        email: voter.email,
        mobile: voter.mobile,
        status: formatVoterStatus(voter),
        dateOfBirth: voter.dateOfBirth || null,
        address: voter.address || "",
        district: voter.district || "",
        province: voter.province || "",
        photoUrl: voter.profilePhoto || "",
        createdAt: voter.createdAt,
        updatedAt: voter.updatedAt,
      },
    });
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
  updateVoter,
};
