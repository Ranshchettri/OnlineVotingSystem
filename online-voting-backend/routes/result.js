const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  calculateResults,
  getResults,
} = require("../controllers/resultController");

// Admin-only: Calculate and end election
router.get("/admin/:electionId", protect, adminOnly, calculateResults);

// Voter-facing read-only results (already ended)
router.get("/voter/:electionId", protect, getResults);

module.exports = router;
