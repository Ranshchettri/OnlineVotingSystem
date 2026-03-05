const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    },

    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
    },

    // Verification data
    faceVerified: {
      type: Boolean,
      default: false,
    },

    faceMatchScore: {
      type: Number,
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    ipAddress: String,
    userAgent: String,
    location: {
      latitude: Number,
      longitude: Number,
    },

    transactionHash: {
      type: String, // future blockchain
    },

    voteHash: {
      type: String,
    },

    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

//  Prevent double voting
voteSchema.index({ userId: 1, electionId: 1 }, { unique: true });
voteSchema.index({ electionId: 1, partyId: 1 });

module.exports = mongoose.model("Vote", voteSchema);
