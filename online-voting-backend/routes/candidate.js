const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  createCandidate,
  getCandidates,
} = require("../controllers/candidateController");

router.post("/", protect, adminOnly, createCandidate);
router.get("/", protect, getCandidates);

module.exports = router;
