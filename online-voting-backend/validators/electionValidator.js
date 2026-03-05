const validateElection = (req, res, next) => {
  const {
    title,
    type,
    startDate,
    endDate,
    totalSeats,
    electionSystem,
    prMethod,
    partyThresholdPercent,
  } = req.body;

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
  const normalizedType = String(type || "").toLowerCase();
  const validTypes = ["political", "student", "local", "provincial", "national"];
  if (!validTypes.includes(normalizedType)) {
    return res.status(400).json({
      message:
        "Election type must be one of: political, student, local, provincial, national",
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

  if (totalSeats !== undefined) {
    const seats = Number(totalSeats);
    if (!Number.isInteger(seats) || seats <= 0 || seats > 1000) {
      return res.status(400).json({
        message: "totalSeats must be an integer between 1 and 1000",
      });
    }
  }

  if (electionSystem !== undefined) {
    const system = String(electionSystem).toUpperCase();
    const validSystems = ["FPTP", "PR", "HYBRID"];
    if (!validSystems.includes(system)) {
      return res.status(400).json({
        message: "electionSystem must be FPTP, PR, or Hybrid",
      });
    }
  }

  if (prMethod !== undefined) {
    const method = String(prMethod).toUpperCase();
    const validMethods = ["SIMPLE", "DHONDT", "SAINTE_LAGUE"];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        message: "prMethod must be SIMPLE, DHONDT, or SAINTE_LAGUE",
      });
    }
  }

  if (partyThresholdPercent !== undefined) {
    const threshold = Number(partyThresholdPercent);
    if (Number.isNaN(threshold) || threshold < 0 || threshold > 100) {
      return res.status(400).json({
        message: "partyThresholdPercent must be between 0 and 100",
      });
    }
  }

  next();
};

module.exports = { validateElection };
