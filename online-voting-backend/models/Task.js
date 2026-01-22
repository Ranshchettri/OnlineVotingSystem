const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
