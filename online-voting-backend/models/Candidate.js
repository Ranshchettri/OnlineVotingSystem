const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    partyName: {
      type: String, // optional for student election
    },

    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },

    profileImage: {
      type: String,
    },

    totalTaskCompletion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Candidate", candidateSchema);
