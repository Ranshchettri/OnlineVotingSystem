const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log(" Admin credentials not found in .env");
      return;
    }

    const existingAdmin = await User.findOne({ role: "admin" });
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (existingAdmin) {
      existingAdmin.email = adminEmail;
      existingAdmin.password = hashedPassword;
      existingAdmin.isEmailVerified = true;
      existingAdmin.verified = true;
      existingAdmin.verificationStatus = "auto-approved";
      await existingAdmin.save();
      console.log(" Admin account updated with .env credentials");
    } else {
      await User.create({
        fullName: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        voterIdNumber: "ADMIN-0001",
        verified: true,
        verificationStatus: "auto-approved",
        isEmailVerified: true,
      });
      console.log(" Admin account seeded successfully");
    }
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
  }
};

module.exports = seedAdmin;
