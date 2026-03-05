const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  calculateResults,
  listPublishedResults,
  getResults,
  getResultSummary,
  getCoalitions,
  getPartyStandings,
} = require("../controllers/resultController");

// Admin-only: Calculate and end election
router.get("/admin/:electionId", protect, adminOnly, calculateResults);
router.get("/", protect, listPublishedResults);

// Voter-facing read-only results (already ended)
router.get("/voter/:electionId", protect, getResults);
router.get("/party/:electionId", protect, getPartyStandings);
router.get("/coalitions/:electionId", protect, getCoalitions);
router.get("/:electionId", protect, getResultSummary);

module.exports = router;
