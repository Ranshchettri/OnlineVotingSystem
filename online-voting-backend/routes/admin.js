const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  getDashboardStats,
  getLiveVotes,
  getActivities,
  listElections,
  createElection,
  stopElection,
  getVoters,
  verifyVoter,
  deleteVoter,
  activateParty,
  getPartyAnalyticsDetailed,
  updatePartyAnalyticsDetailed,
  createNotification,
  broadcastNotification,
  getLiveTracking,
  getAuditLogs,
} = require("../controllers/adminController");

// Dashboard
router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/dashboard/live-votes/:electionId", protect, adminOnly, getLiveVotes);
router.get("/dashboard/activities", protect, adminOnly, getActivities);

// Elections
router.get("/elections", protect, adminOnly, listElections);
router.post("/elections", protect, adminOnly, createElection);
router.post("/election", protect, adminOnly, createElection); // alias for frontend service
router.put("/elections/:id/stop", protect, adminOnly, stopElection);

// Voters
router.get("/voters", protect, adminOnly, getVoters);
router.put("/voters/:id/verify", protect, adminOnly, verifyVoter);
router.post("/voter/:id/approve", protect, adminOnly, verifyVoter); // alias
router.delete("/voters/:id", protect, adminOnly, deleteVoter);

// Parties
router.patch("/party/:id/activate", protect, adminOnly, activateParty);

// Analytics
router.get("/analytics/party/:partyId/detailed", protect, adminOnly, getPartyAnalyticsDetailed);
router.put("/analytics/party/:partyId/update", protect, adminOnly, updatePartyAnalyticsDetailed);

// Notifications
router.post("/notifications/create", protect, adminOnly, createNotification);
router.post("/notifications/broadcast", protect, adminOnly, broadcastNotification);

// Live tracking
router.get("/live-tracking/:electionId", protect, adminOnly, getLiveTracking);

// Audit logs
router.get("/audit-logs", protect, adminOnly, getAuditLogs);

module.exports = router;
