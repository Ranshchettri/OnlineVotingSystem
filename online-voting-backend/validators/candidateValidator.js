const validateCandidate = (req, res, next) => {
  const { fullName, electionId } = req.body;

  // Check required fields
  if (!fullName || !electionId) {
    return res.status(400).json({
      message: "Full name and election ID are required",
    });
  }

  // Validate full name
  if (fullName.trim().length < 2) {
    return res.status(400).json({
      message: "Candidate full name must be at least 2 characters long",
    });
  }

  // Validate election ID format (MongoDB ObjectId)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(electionId)) {
    return res.status(400).json({
      message: "Please provide a valid election ID",
    });
  }

  // Optional: Validate party name if provided
  const { partyName } = req.body;
  if (partyName && partyName.trim().length < 2) {
    return res.status(400).json({
      message: "Party name must be at least 2 characters long if provided",
    });
  }

  next();
};

module.exports = { validateCandidate };
