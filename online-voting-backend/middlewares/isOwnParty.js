const isOwnParty = (req, res, next) => {
  const partyIdFromUser = req.user.partyId?.toString();
  const partyIdFromParams = req.params.partyId || req.body.partyId;

  if (!partyIdFromUser || partyIdFromUser !== partyIdFromParams) {
    return res.status(403).json({
      message: "Unauthorized party access",
    });
  }
  next();
};

module.exports = { isOwnParty };
