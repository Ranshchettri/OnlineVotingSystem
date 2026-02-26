import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/notifications.css";

const formatRelativeTime = (value) => {
  if (!value) return "just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} min ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hour${Math.floor(diffMs / hour) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffMs / day)} day${Math.floor(diffMs / day) > 1 ? "s" : ""} ago`;
};

const Icon = ({ type }) => {
  if (type === "warning") return <i className="ri-error-warning-line" aria-hidden="true" />;
  if (type === "success") return <i className="ri-checkbox-circle-line" aria-hidden="true" />;
  if (type === "error") return <i className="ri-close-circle-line" aria-hidden="true" />;
  return <i className="ri-information-line" aria-hidden="true" />;
};

export default function PartyNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/notifications");
      const payload = res.data?.data || {};
      const notifications = Array.isArray(payload.notifications) ? payload.notifications : [];
      setItems(notifications);
      setUnreadCount(Number(payload.unreadCount || 0));
      setError("");
    } catch (err) {
      setItems([]);
      setUnreadCount(0);
      setError(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark notifications as read.");
    }
  };

  const markSingleRead = async (item) => {
    const id = item?.id;
    if (!id || item?.isRead) return;
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update notification.");
    }
  };

  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with election news and system updates</p>
        </div>
      </div>

      {error ? <div className="notif-error">{error}</div> : null}

      <div className="notif-card party-card">
        <div className="notif-card-head">
          <div className="notif-card-title">
            Recent Notifications
            {unreadCount > 0 ? ` (${unreadCount} unread)` : ""}
          </div>
          <button
            className="notif-mark"
            type="button"
            onClick={markAllAsRead}
            disabled={items.length === 0 || unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>
        <div className="notif-list">
          {loading ? (
            <div className="notif-item info">
              <div className="notif-icon">
                <i className="ri-loader-4-line" aria-hidden="true" />
              </div>
              <div className="notif-body">
                <strong>Loading notifications...</strong>
                <p>Please wait while we fetch latest updates.</p>
              </div>
              <span className="notif-time">now</span>
            </div>
          ) : null}

          {!loading && items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`notif-item ${item.type || "info"} ${item.isRead ? "" : "unread"}`}
              onClick={() => markSingleRead(item)}
            >
              <div className="notif-icon">
                <Icon type={item.type} />
              </div>
              <div className="notif-body">
                <strong>{item.title || "Notification"}</strong>
                <p>{item.message || "-"}</p>
              </div>
              <span className="notif-time">{formatRelativeTime(item.createdAt)}</span>
            </button>
          ))}

          {!loading && items.length === 0 ? (
            <div className="notif-item info">
              <div className="notif-icon">
                <i className="ri-information-line" aria-hidden="true" />
              </div>
              <div className="notif-body">
                <strong>No notifications</strong>
                <p>Everything is up to date.</p>
              </div>
              <span className="notif-time">now</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="notif-email">
        <div className="notif-email-title">
          <span>
            <i className="ri-mail-line" aria-hidden="true" />
          </span>
          <div>
            <strong>Email Notifications</strong>
            <p>Important updates are also delivered through your registered email.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
