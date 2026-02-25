const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true },
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election" },
    totalVotes: { type: Number, default: 0 },
    votesByRegion: [
      {
        region: String,
        votes: Number,
      },
    ],
    votesByAge: [
      {
        ageGroup: String,
        votes: Number,
      },
    ],
    votesByGender: {
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    votesOverTime: [
      {
        timestamp: Date,
        votes: Number,
      },
    ],
  },
  { timestamps: true },
);

analyticsSchema.index({ partyId: 1, electionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Analytics", analyticsSchema);
