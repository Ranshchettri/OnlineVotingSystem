const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["Political", "Local", "Provincial", "political", "student"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Upcoming", "Running", "Ended"],
      default: "Upcoming",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    allowVoting: {
      type: Boolean,
      default: true,
    },

    requireFaceVerification: {
      type: Boolean,
      default: true,
    },

    requireOTP: {
      type: Boolean,
      default: true,
    },

    participatingParties: [
      {
        partyId: { type: mongoose.Schema.Types.ObjectId, ref: "Party" },
        votes: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
      },
    ],

    totalVoters: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
    turnout: { type: Number, default: 0 },

    results: [
      {
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
        totalVotes: Number,
      },
    ],

    winnerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }],

    isEnded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

electionSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model("Election", electionSchema);
