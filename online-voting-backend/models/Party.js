const mongoose = require("mongoose");

// Clear any cached model
delete mongoose.models.Party;

console.log("Loading Party model with enum:", [
  "National",
  "Student",
  "Local",
  "Political",
  "Provincial",
  "political",
  "student",
]);

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
  },
  role: {
    type: String,
  },
  photo: {
    type: String,
  },
  bio: {
    type: String,
  },
});

const partySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    shortName: {
      type: String,
    },

    logo: {
      type: String,
    },

    leader: {
      type: String,
    },

    email: {
      type: String,
    },

    mobile: {
      type: String,
    },

    electionType: {
      type: String,
      enum: [
        "National",
        "Student",
        "Local",
        "Political",
        "Provincial",
        "political",
        "student",
      ],
      required: false,
      default: "Political",
    },

    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: false,
    },

    establishedDate: {
      type: Date,
    },

    headquarters: {
      type: String,
    },

    totalMembers: {
      type: Number,
      default: 0,
    },

    motivationQuote: {
      type: String,
    },

    vision: {
      type: String,
    },

    manifesto: {
      type: String,
    },

    ideology: {
      type: String,
    },

    // Frontend-friendly fields
    symbol: {
      type: String,
    },

    description: {
      type: String,
    },

    color: {
      type: String,
      default: "#7c7cff",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    currentVotes: {
      type: Number,
      default: 0,
    },

    totalWins: { type: Number, default: 0 },
    electionWins: { type: Number, default: 0 },

    goodWorkPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    badWorkPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    development: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    goodWork: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    badWork: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    detailedMetrics: {
      infrastructure: { type: Number, default: 0 },
      healthcare: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      economy: { type: Number, default: 0 },
      policyFailures: { type: Number, default: 0 },
      corruptionCases: { type: Number, default: 0 },
      publicComplaints: { type: Number, default: 0 },
    },

    documents: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    historicalData: [
      {
        year: Number,
        development: Number,
        goodWork: Number,
        badWork: Number,
        votes: Number,
      },
    ],

    futurePlans: [String],

    teamMembers: [teamMemberSchema],

    achievements: [
      {
        year: Number,
        title: String,
        description: String,
      },
    ],

    socialMedia: {
      facebook: String,
      twitter: String,
      website: String,
    },

    contact: {
      address: String,
      phone: String,
      email: String,
    },

    gallery: [String],

    statistics: {
      totalVotesReceived: { type: Number, default: 0 },
      averageVoteShare: { type: Number, default: 0 },
      bestPerformanceYear: Number,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Party", partySchema);
