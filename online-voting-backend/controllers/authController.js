const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

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

    // Skip email verification for this build (demo)

    // If admin, initiate OTP flow (do NOT issue JWT yet)
    if (user.role === "admin") {
      const otp = "999999"; // fixed for demo

      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await user.save();

      return res.json({
        message: "Admin OTP generated (demo)",
        otpRequired: true,
        adminId: user._id,
        otp,
      });
    }

    // Non-admin: generate JWT and continue as before
    const token = jwt.sign(
      { id: user._id, role: user.role, verified: user.verified },
      JWT_SECRET,
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
      JWT_SECRET,
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

// 🔴 PARTY OTP LOGIN (email must end with _gov@ovs.gov.np)
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

    // Fixed OTP for demo
    const otp = "54321";

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    res.json({
      message: "OTP generated (demo)",
      otp,
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

    // Ensure partyId is linked; fallback to first party record
    if (!party.partyId) {
      const PartyModel = require("../models/Party");
      const firstParty = await PartyModel.findOne({}).lean();
      if (firstParty?._id) {
        party.partyId = firstParty._id;
      }
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
      JWT_SECRET,
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

// VOTER LOGIN (email + voterId, OTP fixed 123456, no email)
const voterLogin = async (req, res) => {
  try {
    const { email, voterId } = req.body;
    if (!email || !voterId) {
      return res.status(400).json({ message: "Email and Voter ID are required" });
    }
    const voter = await User.findOne({
      email,
      role: "voter",
      $or: [{ voterId }, { voterIdNumber: voterId }],
    });
    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }
    const otp = "123456";
    voter.otp = otp;
    voter.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await voter.save();
    return res.json({
      message: "Voter OTP generated (demo)",
      otp,
      voterId: voter._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyVoterOtp = async (req, res) => {
  try {
    const { voterId, otp } = req.body;
    if (!voterId || !otp) {
      return res.status(400).json({ message: "Voter ID and OTP required" });
    }
    const voter = await User.findById(voterId);
    if (!voter || voter.role !== "voter") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!voter.otp || voter.otp !== otp || !voter.otpExpiry || voter.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Auto-approve normal voters on successful OTP login.
    if (!["blocked", "rejected"].includes(String(voter.verificationStatus || "").toLowerCase())) {
      voter.isVerified = true;
      voter.verified = true;
      voter.verificationStatus = "auto-approved";
    }

    voter.otp = undefined;
    voter.otpExpiry = undefined;
    await voter.save();
    const token = jwt.sign(
      { id: voter._id, role: voter.role, voterId: voter.voterId || voter.voterIdNumber },
      JWT_SECRET,
    );
    return res.json({
      token,
      user: {
        id: voter._id,
        email: voter.email,
        voterId: voter.voterId || voter.voterIdNumber,
        fullName: voter.fullName,
        profilePhoto: voter.profilePhoto,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    // Demo identities are injected by middleware and do not exist in DB.
    if (typeof req.user?._id === "string" && req.user._id.startsWith("demo-")) {
      return res.json({
        data: {
          id: req.user._id,
          role: req.user.role,
          email: req.user.email || "",
        },
      });
    }

    const voterId = req.user?.voterId || req.user?.voterIdNumber;
    const verificationStatus =
      req.user?.verificationStatus === "pending" && (req.user?.isVerified || req.user?.verified)
        ? "auto-approved"
        : req.user?.verificationStatus || "pending";
    return res.json({
      data: {
        id: req.user?._id,
        fullName: req.user?.fullName,
        email: req.user?.email,
        mobile: req.user?.mobile || "",
        role: req.user?.role,
        voterId: voterId || "",
        voterIdNumber: req.user?.voterIdNumber || "",
        address: req.user?.address || "",
        dateOfBirth: req.user?.dateOfBirth || null,
        profilePhoto: req.user?.profilePhoto || "",
        verificationStatus,
        verified: Boolean(req.user?.verified),
        isVerified: Boolean(req.user?.isVerified),
        hasVoted: Boolean(req.user?.hasVoted),
        createdAt: req.user?.createdAt || null,
        updatedAt: req.user?.updatedAt || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
  voterLogin,
  verifyVoterOtp,
  getMe,
};
