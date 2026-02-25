const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "voter", "party"],
      default: "voter",
    },

    adminLevel: {
      type: String,
      enum: ["super", "moderator"],
      default: "moderator",
    },

    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      default: null,
    },

    partyRole: {
      type: String,
      enum: ["admin", "member"],
    },

    isStudent: {
      type: Boolean,
      default: false,
    },

    voterId: {
      type: String,
      unique: true,
      sparse: true,
    },

    voterIdNumber: {
      type: String,
      unique: true,
    },

    dateOfBirth: {
      type: Date,
    },

    address: {
      type: String,
    },

    profilePhoto: {
      type: String, // Base64 or URL
    },

    faceEmbedding: {
      type: [Number], // 512-d vector
      default: undefined,
    },

    voterCardImage: {
      type: String, // file path / cloud URL
    },

    verificationStatus: {
      type: String,
      enum: ["auto-approved", "pending", "rejected", "blocked"],
      default: "pending",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    hasVoted: {
      type: Boolean,
      default: false,
    },

    votedElectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
    },

    votedAt: {
      type: Date,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationCode: {
      type: String,
    },

    emailVerificationExpires: {
      type: Date,
    },

    passwordResetCode: {
      type: String,
    },

    passwordResetExpires: {
      type: Date,
    },

    // Admin OTP for two-factor login
    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
