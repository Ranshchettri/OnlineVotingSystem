const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  getVoterStats,
  approveVoter,
  blockVoter,
  rejectVoter,
  createVoter,
  updateVoter,
} = require("../controllers/voterAdminController");

router.get("/admin/stats", protect, adminOnly, getVoterStats);
router.post("/admin/:id/approve", protect, adminOnly, approveVoter);
router.post("/admin/:id/block", protect, adminOnly, blockVoter);
router.post("/admin/:id/reject", protect, adminOnly, rejectVoter);
router.post("/admin", protect, adminOnly, createVoter);
router.put("/admin/:id", protect, adminOnly, updateVoter);
router.get("/", protect, adminOnly, getVoterStats);

module.exports = router;
