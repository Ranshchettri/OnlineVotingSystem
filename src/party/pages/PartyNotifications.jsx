import { partyNotifications } from "../data/fakePartyData";
import "../styles/notifications.css";

const Icon = ({ id, type }) => {
  if (id === "start") return <i className="ri-notification-3-line" aria-hidden="true" />;
  if (id === "deadline") return <i className="ri-error-warning-line" aria-hidden="true" />;
  if (id === "milestone") return <i className="ri-trophy-line" aria-hidden="true" />;
  if (id === "maintenance") return <i className="ri-tools-line" aria-hidden="true" />;
  if (id === "results") return <i className="ri-file-list-line" aria-hidden="true" />;
  if (type === "warning") return <i className="ri-error-warning-line" aria-hidden="true" />;
  if (type === "info") return <i className="ri-information-line" aria-hidden="true" />;
  return <i className="ri-checkbox-circle-line" aria-hidden="true" />;
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
            <i className="ri-mail-line" aria-hidden="true" />
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
