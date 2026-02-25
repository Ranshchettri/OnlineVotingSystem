const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { partyOnly } = require("../middlewares/partyOnly");
const {
  getParties,
  getPartyProfile,
  createParty,
  updateParty,
  deleteParty,
  getPartyDashboard,
  updatePartyProfile,
  getPartyAnalytics,
  getPartyResults,
} = require("../controllers/partyController");
const { getPartyStats } = require("../controllers/partyStatsController");
const {
  getPartyProfileFull,
  updatePartyProfileFull,
  getFuturePlans,
  updateFuturePlans,
  getProgress,
  getPastPerformance,
  getCurrentStats,
} = require("../controllers/partyFeatureController");

// 🔴 PARTY ROUTES (Protected with partyOnly middleware)
router.get("/dashboard", protect, partyOnly, getPartyDashboard);

router.put("/profile", protect, partyOnly, updatePartyProfile);
router.get("/profile/full", protect, partyOnly, getPartyProfileFull);
router.put("/profile/full", protect, partyOnly, updatePartyProfileFull);

router.get("/analytics", protect, partyOnly, getPartyAnalytics);

router.get("/results", protect, partyOnly, getPartyResults);

router.get("/future-plans", protect, partyOnly, getFuturePlans);
router.put("/future-plans", protect, partyOnly, updateFuturePlans);
router.get("/progress", protect, partyOnly, getProgress);
router.get("/past-performance", protect, partyOnly, getPastPerformance);
router.get("/current-stats", protect, partyOnly, getCurrentStats);

// Public routes (now open for dashboards)
router.get("/", getParties);
router.get("/:partyId", getPartyProfile);
router.get("/:partyId/stats", getPartyStats);
router.get("/:partyId/future-plans", getFuturePlans);
router.put("/:partyId/future-plans", protect, updateFuturePlans);
router.get("/:partyId/progress", getProgress);
router.get("/:partyId/past-performance", getPastPerformance);
router.get("/:partyId/current-stats", getCurrentStats);

// Admin routes
router.post("/", protect, adminOnly, createParty);
router.put("/:partyId", protect, adminOnly, updateParty);
router.patch("/:partyId", protect, adminOnly, updateParty);
router.delete("/:partyId", protect, adminOnly, deleteParty);

module.exports = router;
