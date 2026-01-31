const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { getCandidateAnalytics } = require("../controllers/analyticsController");
const router = express.Router();

router.get("/candidates", protect, adminOnly, getCandidateAnalytics);

module.exports = router;
