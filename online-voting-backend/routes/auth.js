const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  verifyAdminOtp,
  forgotPassword,
  resetPassword,
  partyLogin,
  verifyPartyOtp,
  voterLogin,
  verifyVoterOtp,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
} = require("../validators/authValidator");
const {
  validateForgotPassword,
  validateResetPassword,
} = require("../validators/passwordValidator");

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/admin/verify-otp", verifyAdminOtp);

// 🔴 PARTY LOGIN ROUTES
router.post("/party-login", partyLogin);
router.post("/party/verify-otp", verifyPartyOtp);

// VOTER LOGIN ROUTES
router.post("/voter/login", voterLogin);
router.post("/voter/verify-otp", verifyVoterOtp);
router.get("/me", protect, getMe);

module.exports = router;
