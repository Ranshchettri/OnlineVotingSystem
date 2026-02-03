const partyOnly = (req, res, next) => {
  if (req.user.role !== "party") {
    return res.status(403).json({
      message: "Access denied: Party only",
    });
  }
  next();
};

module.exports = { partyOnly };
