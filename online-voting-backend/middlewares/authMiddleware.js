const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Party = require("../models/Party");
const { shouldInvalidateToken } = require("../utils/sessionControl");

const protect = async (req, res, next) => {
  let token;

  // Accept a demo token to keep admin preview open (per client request)
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader === "Bearer admin-demo") {
    req.user = {
      _id: "000000000000000000000001",
      role: "admin",
      isEmailVerified: true,
      verified: true,
    };
    return next();
  }

  if (authHeader && authHeader === "Bearer party-demo") {
    req.user = {
      _id: "000000000000000000000002",
      role: "party",
      isEmailVerified: true,
      verified: true,
    };
    return next();
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (shouldInvalidateToken(decoded)) {
        return res.status(401).json({ message: "Session expired. Please log in again." });
      }

      // Find user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      const verification = String(req.user.verificationStatus || "").toLowerCase();
      if (["blocked", "rejected"].includes(verification)) {
        return res.status(403).json({ message: "Account is blocked by admin" });
      }

      if (req.user.role === "party" && req.user.partyId) {
        const party = await Party.findById(req.user.partyId).select("status isActive");
        if (party) {
          const partyStatus = String(party.status || "").toLowerCase();
          if (party.isActive === false || ["blocked", "rejected", "pending"].includes(partyStatus)) {
            return res.status(403).json({ message: "Party account is blocked for this election" });
          }
        }
      }

      // Keep strict email-verification gate only for admin web login flows.
      // Party and voter users authenticate via OTP in this project.
      const requireEmailVerified = req.user.role === "admin";
      if (
        requireEmailVerified &&
        !req.user.isEmailVerified &&
        !req.path.includes("/verify-email") &&
        !req.path.includes("/forgot-password") &&
        !req.path.includes("/reset-password")
      ) {
        return res
          .status(403)
          .json({ message: "Please verify your email first" });
      }

      return next(); // allow request
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
