const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllNotificationsRead);
router.patch("/:notificationId/read", protect, markNotificationRead);

module.exports = router;
