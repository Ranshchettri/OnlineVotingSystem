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

// 🔴 PARTY ROUTES (Protected with partyOnly middleware)
router.get("/dashboard", protect, partyOnly, getPartyDashboard);

router.put("/profile", protect, partyOnly, updatePartyProfile);

router.get("/analytics", protect, partyOnly, getPartyAnalytics);

router.get("/results", protect, partyOnly, getPartyResults);

// Public routes (protected)
router.get("/", protect, getParties);
router.get("/:partyId", protect, getPartyProfile);

// Admin routes
router.post("/", protect, adminOnly, createParty);
router.put("/:partyId", protect, adminOnly, updateParty);
router.patch("/:partyId", protect, adminOnly, updateParty);
router.delete("/:partyId", protect, adminOnly, deleteParty);

module.exports = router;
