const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const Task = require("../models/Task");

// Get Candidate Analytics
const getCandidateAnalytics = async (req, res, next) => {
  try {
    const candidates = await Candidate.find().sort({ totalTaskCompletion: -1 });

    const data = await Promise.all(
      candidates.map(async (c) => {
        const votes = await Vote.countDocuments({ candidateId: c._id });
        const tasks = await Task.find({ candidateId: c._id });
        return {
          candidateId: c._id,
          fullName: c.fullName,
          partyName: c.partyName,
          totalTaskCompletion: c.totalTaskCompletion,
          totalVotes: votes,
          tasks: tasks.map((t) => ({
            title: t.title,
            completionPercentage: t.completionPercentage,
            verified: t.verified,
          })),
        };
      }),
    );

    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCandidateAnalytics };
