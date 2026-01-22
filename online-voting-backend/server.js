const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    // Seed admin account
    const seedAdmin = require("./utils/seedAdmin");
    await seedAdmin();
  })
  .catch((err) => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("Online Voting Backend Working!");
});

const authRoutes = require("./routes/auth");
const electionRoutes = require("./routes/election");
const candidateRoutes = require("./routes/candidate");
const taskRoutes = require("./routes/task");
const voteRoutes = require("./routes/vote");

app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/votes", voteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
