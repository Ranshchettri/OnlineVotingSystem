const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  verifyAdminOtp,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
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

module.exports = router;
