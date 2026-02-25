const Party = require("../models/Party");
const AppError = require("../utils/AppError");

// GET /api/parties/:partyId/stats
const getPartyStats = async (req, res, next) => {
  try {
    const { partyId } = req.params;
    const party = await Party.findById(partyId);
    if (!party) return next(new AppError("Party not found", 404));

    res.json({
      data: {
        partyId,
        development: party.development ?? party.goodWorkPercent ?? 0,
        goodWork: party.goodWork ?? party.goodWorkPercent ?? 0,
        badWork: party.badWork ?? party.badWorkPercent ?? 0,
        totalWins: party.totalWins || party.electionWins || 0,
        totalVotes: party.currentVotes || 0,
        status: party.status || (party.isActive ? "approved" : "pending"),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPartyStats };
