import { partyNotifications } from "../data/fakePartyData";
import "../styles/notifications.css";

const iconMap = {
  success: "check",
  warning: "warning",
  info: "info",
  neutral: "gear",
};

const Icon = ({ type }) => {
  if (type === "warning") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4" />
        <circle cx="12" cy="17" r="1" />
        <path d="M10 3h4l7 14H3z" />
      </svg>
    );
  }
  if (type === "info") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6" />
        <path d="M12 7h.01" />
      </svg>
    );
  }
  if (type === "gear") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V21a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H3a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V3a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H21a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6l-8 8-4-4" />
    </svg>
  );
};

export default function PartyNotifications() {
  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>{partyNotifications.title}</h1>
          <p>{partyNotifications.subtitle}</p>
        </div>
        <button className="notif-mark" type="button">
          Mark all as read
        </button>
      </div>

      <div className="notif-card party-card">
        <div className="notif-card-title">Recent Notifications</div>
        <div className="notif-list">
          {partyNotifications.items.map((item) => (
            <div key={item.id} className={`notif-item ${item.type}`}>
              <div className="notif-icon">
                <Icon type={iconMap[item.type]} />
              </div>
              <div className="notif-body">
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
              <span className="notif-time">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="notif-email">
        <div className="notif-email-title">
          <span>i</span>
          Email Notifications
        </div>
        <ul>
          {partyNotifications.email.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
