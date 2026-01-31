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
const taskRoutes = require("./routes/task");
const voteRoutes = require("./routes/vote");
const analyticsRoutes = require("./routes/analytics");
const resultRoutes = require("./routes/result");

app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/results", resultRoutes);

// Global error handling middleware (must be last)
const errorHandler = require("./middlewares/errorMiddleware");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
