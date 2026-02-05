import { partyNotifications } from "../data/fakePartyData";
import "../styles/notifications.css";

const Icon = ({ id, type }) => {
  if (id === "start") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 8a6 6 0 0 1 12 0v4l2 2H4l2-2z" />
        <path d="M9 18h6" />
      </svg>
    );
  }
  if (id === "deadline") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4" />
        <circle cx="12" cy="17" r="1" />
        <path d="M10 3h4l7 14H3z" />
      </svg>
    );
  }
  if (id === "milestone") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v4H7z" />
        <path d="M6 8h12l-1 5H7z" />
      </svg>
    );
  }
  if (id === "maintenance") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 7l3 3-7 7-3-3z" />
        <path d="M7 7l3 3" />
        <path d="M17 17l3 3" />
      </svg>
    );
  }
  if (id === "results") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h6" />
      </svg>
    );
  }
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
                <Icon id={item.id} type={item.type} />
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
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16v12H4z" />
              <path d="M4 7l8 6 8-6" />
            </svg>
          </span>
          <div>
            <strong>Email Notifications</strong>
            <p>You will receive email notifications for important updates:</p>
          </div>
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
