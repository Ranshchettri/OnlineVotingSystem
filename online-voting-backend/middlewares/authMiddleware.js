const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // 1 Token check (Authorization header)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2 Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3 Find user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 4 Check if email is verified (skip for auth routes that don't require verification)
      if (
        !req.user.isEmailVerified &&
        !req.path.includes("/verify-email") &&
        !req.path.includes("/forgot-password") &&
        !req.path.includes("/reset-password")
      ) {
        return res
          .status(403)
          .json({ message: "Please verify your email first" });
      }

      next(); // allow request
    } catch (error) {
      return res.status(401).json({ message: "Token invalid" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token, access denied" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access only" });
  }
};

module.exports = { protect, adminOnly };
