const validateParty = (req, res, next) => {
  const { name, electionType, electionId } = req.body;

  const errors = [];

  if (!name || name.trim() === "") {
    errors.push("Party name is required");
  }

  if (!electionType) {
    errors.push("Election type is required");
  } else if (!["National", "Student", "Local"].includes(electionType)) {
    errors.push("Election type must be one of: National, Student, Local");
  }

  if (!electionId) {
    errors.push("Election ID is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

module.exports = { validateParty };
