const validateTask = (req, res, next) => {
  const { candidateId, title, description } = req.body;

  // Check required fields
  if (!candidateId || !title) {
    return res.status(400).json({
      message: "Candidate ID and title are required",
    });
  }

  // Validate title
  if (title.trim().length < 3) {
    return res.status(400).json({
      message: "Task title must be at least 3 characters long",
    });
  }

  // Validate candidate ID format (MongoDB ObjectId)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(candidateId)) {
    return res.status(400).json({
      message: "Invalid candidate ID format",
    });
  }

  next();
};

const validateTaskVerification = (req, res, next) => {
  const { taskId, completionPercentage } = req.body;

  // Check required fields
  if (!taskId || completionPercentage === undefined) {
    return res.status(400).json({
      message: "Task ID and completion percentage are required",
    });
  }

  // Validate completion percentage
  if (
    typeof completionPercentage !== "number" ||
    completionPercentage < 0 ||
    completionPercentage > 100
  ) {
    return res.status(400).json({
      message: "Completion percentage must be a number between 0 and 100",
    });
  }

  // Validate task ID format
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(taskId)) {
    return res.status(400).json({
      message: "Invalid task ID format",
    });
  }

  next();
};

module.exports = { validateTask, validateTaskVerification };
