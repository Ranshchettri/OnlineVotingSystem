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
  const abs = Math.abs(diffMs);

  if (abs < minute) return "just now";

  if (diffMs >= 0) {
    if (diffMs < hour) return `${Math.floor(diffMs / minute)} min ago`;
    if (diffMs < day) {
      const hours = Math.floor(diffMs / hour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    const days = Math.floor(diffMs / day);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  if (abs < hour) return `in ${Math.ceil(abs / minute)} min`;
  if (abs < day) {
    const hours = Math.ceil(abs / hour);
    return `in ${hours} hour${hours > 1 ? "s" : ""}`;
  }
  const days = Math.ceil(abs / day);
  return `in ${days} day${days > 1 ? "s" : ""}`;
};

const normalizeType = (item = {}) => {
  const explicit = String(item.type || "").toLowerCase();
  if (["info", "warning", "success", "error"].includes(explicit)) return explicit;

  const haystack = `${item.title || ""} ${item.message || ""}`.toLowerCase();
  if (/(blocked|rejected|lost|failed|error)/.test(haystack)) return "error";
  if (/(deadline|maintenance|ended|locked|warning)/.test(haystack)) return "warning";
  if (/(started|milestone|won|published|activated|approved)/.test(haystack)) return "success";
  return "info";
};

const buildDeadlineNotification = (startDate) => {
  if (!startDate) return null;

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;

  const lockAt = new Date(start.getTime() - 24 * 60 * 60 * 1000);
  const now = Date.now();
  const diff = lockAt.getTime() - now;

  if (diff <= 0) {
    return {
      id: "synthetic-editing-deadline",
      synthetic: true,
      isRead: false,
      type: "warning",
      title: "Profile Editing Deadline",
      message: "Profile editing is locked within 24 hours of election start.",
      createdAt: lockAt.toISOString(),
    };
  }

  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  return {
    id: "synthetic-editing-deadline",
    synthetic: true,
    isRead: false,
    type: "warning",
    title: "Profile Editing Deadline",
    message: `Profile editing will be locked in ${days} day${days > 1 ? "s" : ""}. Please complete all updates.`,
    createdAt: lockAt.toISOString(),
  };
};

const Icon = ({ item }) => {
  const text = `${item?.title || ""} ${item?.message || ""}`.toLowerCase();
  if (text.includes("election started")) return <i className="ri-notification-3-line" aria-hidden="true" />;
  if (text.includes("deadline")) return <i className="ri-error-warning-line" aria-hidden="true" />;
  if (text.includes("milestone")) return <i className="ri-trophy-line" aria-hidden="true" />;
  if (text.includes("maintenance")) return <i className="ri-tools-line" aria-hidden="true" />;
  if (text.includes("result")) return <i className="ri-file-chart-line" aria-hidden="true" />;

  if (item?.type === "warning") return <i className="ri-error-warning-line" aria-hidden="true" />;
  if (item?.type === "success") return <i className="ri-checkbox-circle-line" aria-hidden="true" />;
  if (item?.type === "error") return <i className="ri-close-circle-line" aria-hidden="true" />;
  return <i className="ri-information-line" aria-hidden="true" />;
};

export default function PartyNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [notifRes, statsRes] = await Promise.all([
        api.get("/notifications"),
        api.get("/parties/current-stats").catch(() => null),
      ]);

      const notifPayload = notifRes.data?.data || {};
      const sourceNotifications = Array.isArray(notifPayload.notifications)
        ? notifPayload.notifications
        : [];

      const normalized = sourceNotifications.map((item) => ({
        ...item,
        type: normalizeType(item),
      }));

      const startDate = statsRes?.data?.data?.currentElection?.startDate || null;
      const deadlineNotice = buildDeadlineNotification(startDate);

      const hasDeadline = normalized.some((item) =>
        String(item.title || "").toLowerCase().includes("profile editing deadline"),
      );

      const merged = [
        ...normalized,
        ...(deadlineNotice && !hasDeadline ? [deadlineNotice] : []),
      ].sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });

      setItems(merged);
      const unreadFromApi = Number(notifPayload.unreadCount || 0);
      const syntheticUnread = merged.filter((item) => item.synthetic && !item.isRead).length;
      setUnreadCount(unreadFromApi + syntheticUnread);
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
    if (item?.synthetic) {
      setItems((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, isRead: true } : entry)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return;
    }

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
          <div className="notif-card-title">Recent Notifications</div>
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
                <Icon item={item} />
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
            <p>You will receive email notifications for important updates:</p>
          </div>
        </div>
        <ul>
          <li>Election start and end announcements</li>
          <li>Result announcements</li>
          <li>System updates and maintenance schedules</li>
          <li>Important policy changes</li>
        </ul>
      </div>
    </div>
  );
}
