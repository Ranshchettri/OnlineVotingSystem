const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
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

    logo: {
      type: String,
    },

    electionType: {
      type: String,
      enum: ["National", "Student", "Local"],
      required: true,
    },

    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },

    motivationQuote: {
      type: String,
    },

    vision: {
      type: String,
    },

    currentVotes: {
      type: Number,
      default: 0,
    },

    totalWins: {
      type: Number,
      default: 0,
    },

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

    teamMembers: [teamMemberSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Party", partySchema);
