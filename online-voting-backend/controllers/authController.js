const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, isStudent, voterIdNumber } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      isStudent,
      voterIdNumber,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
    });

    await user.save();

    // Send verification email
    await sendEmail({
      to: email,
      subject: "Verify Your Email - Online Voting System",
      html: `
        <h3>Welcome ${fullName}!</h3>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code expires in 10 minutes.</p>
        <p>Use this code to verify your email address.</p>
      `,
    });

    res.status(201).json({
      message:
        "Registration successful. Please check your email for verification code.",
      email: email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    // If admin, initiate OTP flow (do NOT issue JWT yet)
    if (user.role === "admin") {
      const otp = crypto.randomInt(100000, 999999).toString();

      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await user.save();

      try {
        await sendEmail({
          to: user.email,
          subject: "Admin Login OTP",
          html: `
            <h2>Admin Login Verification</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP expires in 5 minutes.</p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send admin OTP email:", emailErr.message);
      }

      return res.json({
        message: "OTP sent to admin email",
        otpRequired: true,
        adminId: user._id,
      });
    }

    // Non-admin: generate JWT and continue as before
    const token = jwt.sign(
      { id: user._id, role: user.role, verified: user.verified },
      process.env.JWT_SECRET,
    );

    // Send login alert email (non-blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: "New Login Detected ",
        html: `
          <h3>Hello ${user.fullName},</h3>
          <p>We detected a new login to your account.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If this wasn't you, please contact support immediately.</p>
        `,
      });
    } catch (emailError) {
      console.error("Login alert email failed:", emailError.message);
      // Don't block login if email fails
    }

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyAdminOtp = async (req, res) => {
  try {
    const { adminId, otp } = req.body;

    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (
      !admin.otp ||
      admin.otp !== otp ||
      !admin.otpExpiry ||
      admin.otpExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Invalidate OTP
    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role, verified: admin.verified },
      process.env.JWT_SECRET,
    );

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        message: "If this email exists, a reset code has been sent",
      });
    }

    // Generate 6-digit reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordResetCode = resetCode;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send reset email
    await sendEmail({
      to: email,
      subject: "Reset Your Password - Online Voting System",
      html: `
        <h3>Hello ${user.fullName},</h3>
        <p>Your password reset code is: <strong>${resetCode}</strong></p>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.json({ message: "If this email exists, a reset code has been sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
      email,
      passwordResetCode: code,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Optional: send confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Changed Successfully",
        html: `
          <h3>Hello ${user.fullName},</h3>
          <p>Your password has been successfully changed.</p>
          <p>If this wasn't you, please contact support immediately.</p>
        `,
      });
    } catch (emailError) {
      console.error(
        "Password change confirmation email failed:",
        emailError.message,
      );
    }

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔴 PARTY OTP LOGIN
const partyLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email, role: "party" });

    if (!user) {
      return res.status(404).json({ message: "Party account not found" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Party not activated by admin" });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    // Send OTP email
    try {
      await sendEmail({
        to: user.email,
        subject: "Party Login OTP",
        html: `
          <h2>Party Login Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
          <p>Do not share this OTP with anyone.</p>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send party OTP email:", emailErr.message);
    }

    res.json({
      message: "OTP sent",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔴 VERIFY PARTY OTP
const verifyPartyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const party = await User.findOne({ email, role: "party" });

    if (!party) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (
      !party.otp ||
      party.otp !== otp ||
      !party.otpExpiry ||
      party.otpExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Invalidate OTP
    party.otp = undefined;
    party.otpExpiry = undefined;
    await party.save();

    // Generate JWT
    const token = jwt.sign(
      {
        id: party._id,
        role: party.role,
        partyId: party.partyId,
        email: party.email,
      },
      process.env.JWT_SECRET,
    );

    res.json({
      token,
      user: {
        name: party.fullName,
        email: party.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  verifyAdminOtp,
  partyLogin,
  verifyPartyOtp,
};
