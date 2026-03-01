const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const Task = require("../models/Task");
const Party = require("../models/Party");

// Get Candidate Analytics
const getCandidateAnalytics = async (req, res, next) => {
  try {
    const candidates = await Candidate.find().sort({ totalTaskCompletion: -1 }).lean();

    if (!candidates.length) {
      const [parties, voteAgg] = await Promise.all([
        Party.find({}).sort({ development: -1, createdAt: -1 }).lean(),
        Vote.aggregate([
          {
            $group: {
              _id: "$partyId",
              votes: { $sum: 1 },
            },
          },
        ]),
      ]);

      const voteMap = voteAgg.reduce((acc, item) => {
        if (!item?._id) return acc;
        acc[item._id.toString()] = item.votes;
        return acc;
      }, {});

      const fallbackData = parties.map((party) => {
        const partyVotes = voteMap[party._id.toString()] || party.currentVotes || 0;
        return {
          candidateId: party._id,
          partyId: party._id,
          fullName: party.leader || party.name,
          partyName: party.name,
          totalTaskCompletion: party.development ?? party.goodWorkPercent ?? 0,
          totalVotes: partyVotes,
          development: party.development ?? party.goodWorkPercent ?? 0,
          goodWork: party.goodWork ?? party.goodWorkPercent ?? 0,
          badWork: party.badWork ?? party.badWorkPercent ?? 0,
          logo: party.logo || party.symbol || "",
          detailedMetrics: party.detailedMetrics || {},
          goodWorkBreakdown: Array.isArray(party.goodWorkBreakdown)
            ? party.goodWorkBreakdown
            : [],
          badWorkBreakdown: Array.isArray(party.badWorkBreakdown)
            ? party.badWorkBreakdown
            : [],
          historicalData: party.historicalData || [],
          tasks: [],
        };
      });

      return res.status(200).json({ status: "success", data: fallbackData });
    }

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
