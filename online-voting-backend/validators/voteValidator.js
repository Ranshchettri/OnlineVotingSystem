const validateVote = (req, res, next) => {
  const { electionId, candidateId } = req.body;

  // Check required fields
  if (!electionId || !candidateId) {
    return res.status(400).json({
      message: "Election ID and Candidate ID are required",
    });
  }

  // Validate ObjectId format
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(electionId)) {
    return res.status(400).json({
      message: "Please provide a valid election ID",
    });
  }

  if (!objectIdRegex.test(candidateId)) {
    return res.status(400).json({
      message: "Please provide a valid candidate ID",
    });
  }

  next();
};

module.exports = { validateVote };
