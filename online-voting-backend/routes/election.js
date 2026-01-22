const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  createElection,
  getElections,
} = require("../controllers/electionController");

router.post("/", protect, adminOnly, createElection);
router.get("/", protect, getElections);

module.exports = router;
