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
      enum: ["admin", "voter"],
      default: "voter",
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
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
