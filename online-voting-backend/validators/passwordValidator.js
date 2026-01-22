const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  // Check required fields
  if (!email) {
    return res.status(400).json({
      message: "Email is required",
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

const validateResetPassword = (req, res, next) => {
  const { email, code, newPassword } = req.body;

  // Check required fields
  if (!email || !code || !newPassword) {
    return res.status(400).json({
      message: "Email, code, and new password are required",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  // Validate code format (6 digits)
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({
      message: "Reset code must be 6 digits",
    });
  }

  // Validate password strength
  if (newPassword.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long",
    });
  }

  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return res.status(400).json({
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    });
  }

  next();
};

module.exports = { validateForgotPassword, validateResetPassword };
