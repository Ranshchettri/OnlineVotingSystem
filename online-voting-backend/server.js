const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

// Middleware
app.use(cors());
// allow large base64 uploads for logo/photo (front-end sends data URLs)
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "devsecret";
}

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    // Seed admin account
    const seedAdmin = require("./utils/seedAdmin");
    await seedAdmin();

    // Auto-close ended elections
    const autoCloseElections = async () => {
      const Election = require("./models/Election");
      const elections = await Election.find({
        isEnded: false,
        endDate: { $lte: new Date() },
      });
      for (const e of elections) {
        // Reuse calculateResults logic
        const { calculateResults } = require("./controllers/resultController");
        await calculateResults(
          { params: { electionId: e._id } },
          { status: () => ({ json: () => {} }) },
          (err) => {
            if (err)
              console.error(`Error closing election ${e._id}:`, err.message);
          },
        );
      }
    };
    await autoCloseElections();
    setInterval(autoCloseElections, 60 * 1000); // Check every 1 minute
  })
  .catch((err) => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("Online Voting Backend Working!");
});

const authRoutes = require("./routes/auth");
const electionRoutes = require("./routes/election");
const candidateRoutes = require("./routes/candidate");
const partyRoutes = require("./routes/party");
const taskRoutes = require("./routes/task");
const voteRoutes = require("./routes/vote");
const analyticsRoutes = require("./routes/analytics");
const resultRoutes = require("./routes/result");
const adminRoutes = require("./routes/admin");
const voterAdminRoutes = require("./routes/voterAdmin");

app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
// Debug logging for incoming parties requests
app.use("/api/parties", (req, res, next) => {
  console.log("[DEBUG] Incoming /api/parties", req.method, req.path, req.query);
  next();
});
app.use("/api/parties", partyRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/voters", voterAdminRoutes);

// Global error handling middleware (must be last)
const errorHandler = require("./middlewares/errorMiddleware");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
