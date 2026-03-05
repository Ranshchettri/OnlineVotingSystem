const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "National",
        "Political",
        "Student",
        "Local",
        "Provincial",
        "national",
        "political",
        "student",
        "local",
        "provincial",
      ],
      required: true,
    },

    electionSystem: {
      type: String,
      enum: ["FPTP", "PR", "Hybrid"],
      default: "FPTP",
    },

    totalSeats: {
      type: Number,
      default: 100,
      min: 1,
    },

    prMethod: {
      type: String,
      enum: ["SIMPLE", "DHONDT", "SAINTE_LAGUE"],
      default: "DHONDT",
    },

    partyThresholdPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
        seats: { type: Number, default: 0 },
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

    resultsPublishedAt: {
      type: Date,
      default: null,
    },

    prResult: {
      totalVotes: { type: Number, default: 0 },
      totalSeats: { type: Number, default: 0 },
      majorityMark: { type: Number, default: 0 },
      method: { type: String, default: "DHONDT" },
      thresholdPercent: { type: Number, default: 0 },
      standings: [
        {
          partyId: { type: mongoose.Schema.Types.ObjectId, ref: "Party" },
          partyName: String,
          shortName: String,
          votes: { type: Number, default: 0 },
          votePercentage: { type: Number, default: 0 },
          seats: { type: Number, default: 0 },
          eligible: { type: Boolean, default: true },
        },
      ],
      majority: {
        type: { type: String, default: "Coalition Required" },
        partyId: { type: mongoose.Schema.Types.ObjectId, ref: "Party" },
        partyName: String,
        seats: { type: Number, default: 0 },
      },
      coalitionRequired: { type: Boolean, default: true },
      coalitionSuggestions: [
        {
          partyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Party" }],
          partyNames: [String],
          totalSeats: { type: Number, default: 0 },
          note: String,
        },
      ],
    },

    resultFrozen: {
      type: Boolean,
      default: false,
    },

    isEnded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

electionSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model("Election", electionSchema);
