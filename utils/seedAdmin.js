const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@vote.gov" });

    if (adminExists) {
      console.log("Admin already exists");
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const admin = new User({
      fullName: "System Admin",
      email: "admin@vote.gov",
      password: hashedPassword,
      role: "admin",
      verified: true,
      voterIdNumber: "ADMIN001",
      verificationStatus: "auto-approved",
    });

    await admin.save();
    console.log("Admin created successfully");
  } catch (error) {
    console.log("Error seeding admin:", error);
  }
};

module.exports = seedAdmin;
