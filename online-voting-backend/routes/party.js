const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  getParties,
  getPartyProfile,
  createParty,
  updateParty,
  deleteParty,
} = require("../controllers/partyController");

// Public routes (protected)
router.get("/", protect, getParties);
router.get("/:partyId", protect, getPartyProfile);

// Admin routes
router.post("/", protect, adminOnly, createParty);
router.put("/:partyId", protect, adminOnly, updateParty);
router.delete("/:partyId", protect, adminOnly, deleteParty);

module.exports = router;
