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

    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log(" Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await User.create({
      fullName: "System Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      verified: true,
      verificationStatus: "auto-approved",
    });

    console.log(" Admin account seeded successfully");
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
  }
};

module.exports = seedAdmin;
