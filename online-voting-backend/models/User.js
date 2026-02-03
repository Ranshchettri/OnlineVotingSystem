const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
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

    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      default: null,
    },

    isStudent: {
      type: Boolean,
      default: false,
    },

    voterIdNumber: {
      type: String,
      required: true,
      unique: true,
    },

    voterCardImage: {
      type: String, // file path / cloud URL
    },

    verificationStatus: {
      type: String,
      enum: ["auto-approved", "pending", "rejected"],
      default: "pending",
    },

    verified: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("User", userSchema);
