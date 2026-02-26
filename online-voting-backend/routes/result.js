const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  calculateResults,
  getResults,
  getPartyStandings,
} = require("../controllers/resultController");

// Admin-only: Calculate and end election
router.get("/admin/:electionId", protect, adminOnly, calculateResults);

// Voter-facing read-only results (already ended)
router.get("/voter/:electionId", protect, getResults);
router.get("/party/:electionId", protect, getPartyStandings);

module.exports = router;
