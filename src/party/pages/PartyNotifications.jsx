import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/notifications.css";

const Icon = ({ type }) => {
  if (type === "warning") return <i className="ri-error-warning-line" aria-hidden="true" />;
  if (type === "success") return <i className="ri-checkbox-circle-line" aria-hidden="true" />;
  return <i className="ri-information-line" aria-hidden="true" />;
};

export default function PartyNotifications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // Build notifications from live stats
        const res = await api.get("/parties/current-stats");
        const data = res.data?.data || {};
        const totalVotes = data.totalVotes || data.stats?.ownVotes || 0;
        const yourShare = data.stats?.voteShare || 0;
        const lead = data.stats?.leadOverSecond || 0;
        setItems([
          {
            id: "live",
            type: "info",
            title: "Live vote update",
            text: `You currently have ${totalVotes} votes with ${yourShare}% share.`,
            time: new Date().toLocaleTimeString(),
          },
          {
            id: "lead",
            type: lead > 0 ? "success" : "warning",
            title: lead > 0 ? "You are leading" : "Lead not established",
            text:
              lead > 0
                ? `You are ahead by ${lead} votes.`
                : "Keep campaigning to secure the lead.",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } catch (err) {
        console.error("Failed to load notifications", err.message);
        setItems([
          {
            id: "fallback",
            type: "warning",
            title: "Unable to fetch live notifications",
            text: "Backend may be offline. Data will refresh automatically once available.",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>Notifications</h1>
          <p>Live updates derived from current stats.</p>
        </div>
      </div>

      <div className="notif-card party-card">
        <div className="notif-card-head">
          <div className="notif-card-title">Recent Notifications</div>
          <button className="notif-mark" type="button" onClick={() => setItems([])}>
            Mark all as read
          </button>
        </div>
        <div className="notif-list">
          {items.map((item) => (
            <div key={item.id} className={`notif-item ${item.type}`}>
              <div className="notif-icon">
                <Icon type={item.type} />
              </div>
              <div className="notif-body">
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
              <span className="notif-time">{item.time}</span>
            </div>
          ))}
          {items.length === 0 && (
            <div className="notif-item info">
              <div className="notif-icon">
                <i className="ri-information-line" aria-hidden="true" />
              </div>
              <div className="notif-body">
                <strong>No notifications</strong>
                <p>Everything is up to date.</p>
              </div>
              <span className="notif-time">{new Date().toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="notif-email">
        <div className="notif-email-title">
          <span>
            <i className="ri-mail-line" aria-hidden="true" />
          </span>
          <div>
            <strong>Email Notifications</strong>
            <p>Important updates will also be sent to your registered email.</p>
          </div>
        </div>
        <ul>
          <li>Live vote snapshots</li>
          <li>Result publications</li>
          <li>System alerts & maintenance</li>
        </ul>
      </div>
    </div>
  );
}
