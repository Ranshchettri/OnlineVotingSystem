require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const BASE = "http://localhost:5000/api";

(async () => {
  try {
    // connect to DB and build admin token for protected routes
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await User.findOne({ role: "admin" });
    if (!admin) throw new Error("Admin user not found in DB");
    const token = jwt.sign(
      { id: admin._id, role: admin.role, verified: admin.verified },
      process.env.JWT_SECRET,
    );
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Listing parties (should be empty or existing)");
    let res = await axios.get(BASE + "/parties");
    console.log("GET /parties:", res.data);

    console.log("\nCreating a party");
    res = await axios.post(BASE + "/parties", {
      name: "Test Party",
      symbol: "Star",
      description: "A test party",
      color: "#ff8800",
    });
    console.log("POST /parties:", res.data);
    const id = res.data.data._id;

    console.log("\nListing parties again");
    res = await axios.get(BASE + "/parties");
    console.log("GET /parties:", res.data);

    console.log("\nToggling isActive -> false");
    res = await axios.patch(BASE + "/parties/" + id, { isActive: false });
    console.log("PATCH /parties/:id:", res.data);

    console.log("\nDeleting party");
    res = await axios.delete(BASE + "/parties/" + id);
    console.log("DELETE /parties/:id:", res.data);

    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err.message);
    if (err.response)
      console.error("RESP:", err.response.status, err.response.data);
    process.exit(1);
  }
})();
