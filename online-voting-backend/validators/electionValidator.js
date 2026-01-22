const validateElection = (req, res, next) => {
  const { title, type, startDate, endDate } = req.body;

  // Check required fields
  if (!title || !type || !startDate || !endDate) {
    return res.status(400).json({
      message: "All fields are required: title, type, startDate, endDate",
    });
  }

  // Validate title
  if (title.trim().length < 3) {
    return res.status(400).json({
      message: "Election title must be at least 3 characters long",
    });
  }

  // Validate election type
  const validTypes = ["political", "student"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      message: "Election type must be either 'political' or 'student'",
    });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      message: "Please provide valid dates for startDate and endDate",
    });
  }

  // Start date must be in the future
  if (start <= now) {
    return res.status(400).json({
      message: "Election start date must be in the future",
    });
  }

  // End date must be after start date
  if (end <= start) {
    return res.status(400).json({
      message: "Election end date must be after the start date",
    });
  }

  // Election duration should not be too long (max 30 days)
  const durationMs = end - start;
  const maxDurationMs = 30 * 24 * 60 * 60 * 1000; // 30 days

  if (durationMs > maxDurationMs) {
    return res.status(400).json({
      message: "Election duration cannot exceed 30 days",
    });
  }

  next();
};

module.exports = { validateElection };
