const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

const mapNotification = (notification = {}) => ({
  id: notification._id,
  type: notification.type || "info",
  title: notification.title || "Notification",
  message: notification.message || "",
  isRead: Boolean(notification.isRead),
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

// GET /api/notifications
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return next(new AppError("Unauthorized", 401));

    const limit = Math.min(Number(req.query.limit || 50), 200);
    const unreadOnly = String(req.query.unreadOnly || "false").toLowerCase() === "true";

    const filter = { userId };
    if (unreadOnly) filter.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    res.json({
      data: {
        notifications: notifications.map(mapNotification),
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:notificationId/read
const markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?._id;
    if (!userId) return next(new AppError("Unauthorized", 401));

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true },
    ).lean();

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    res.json({ success: true, data: mapNotification(notification) });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/read-all
const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return next(new AppError("Unauthorized", 401));

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );

    res.json({
      success: true,
      updatedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
