const validateRegister = (req, res, next) => {
  const { fullName, email, password, voterIdNumber } = req.body;

  // Check required fields
  if (!fullName || !email || !password || !voterIdNumber) {
    return res.status(400).json({
      message:
        "All fields are required: fullName, email, password, voterIdNumber",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  // Validate voter ID format (basic check)
  if (voterIdNumber.length < 3) {
    return res.status(400).json({
      message: "Voter ID must be at least 3 characters long",
    });
  }

  // Validate full name
  if (fullName.trim().length < 2) {
    return res.status(400).json({
      message: "Full name must be at least 2 characters long",
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  next();
};

module.exports = { validateRegister, validateLogin };
