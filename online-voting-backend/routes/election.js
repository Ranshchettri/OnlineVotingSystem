const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { validateElection } = require("../validators/electionValidator");
const {
  createElection,
  getElections,
  getActiveElections,
  toggleElectionStatus,
} = require("../controllers/electionController");

router.post("/", protect, adminOnly, validateElection, createElection);
router.get("/", protect, getElections);
router.get("/active", protect, getActiveElections);
router.patch("/:id/toggle", protect, adminOnly, toggleElectionStatus);

module.exports = router;
