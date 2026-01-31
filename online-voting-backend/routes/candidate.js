const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { validateCandidate } = require("../validators/candidateValidator");
const {
  createCandidate,
  getCandidates,
} = require("../controllers/candidateController");

router.post("/", protect, validateCandidate, createCandidate);
router.get("/", protect, getCandidates);

module.exports = router;
