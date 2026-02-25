import { NavLink } from "react-router-dom";
import { getStoredVoter } from "../utils/user";

const navItems = [
  { label: "Election Overview", path: "/voter/dashboard" },
  { label: "My Profile", path: "/voter/profile" },
  { label: "Results", path: "/voter/results" },
  { label: "Election Timeline", path: "/voter/timeline" },
  { label: "Rules & How-To", path: "/voter/rules" },
];

const icons = [
  "ri-layout-grid-line",
  "ri-user-line",
  "ri-bar-chart-line",
  "ri-calendar-event-line",
  "ri-file-list-line",
];

export default function Sidebar() {
  const voter = getStoredVoter();
  const name = voter?.fullName || voter?.email || "Voter";
  const voterId = voter?.voterId || voter?.voterIdNumber || "N/A";

  return (
    <aside className="voter-sidebar">
      <div className="voter-sidebar-header">
        <div className="voter-avatar">
          <i className="ri-user-3-line" aria-hidden="true" />
        </div>
        <div>
          <p className="voter-profile-name">{name}</p>
          <p className="voter-profile-id">ID: {voterId}</p>
        </div>
      </div>

      <nav className="voter-nav">
        {navItems.map((item, index) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === "/voter/dashboard"}
            className={({ isActive }) =>
              `voter-nav-link ${isActive ? "is-active" : ""}`
            }
          >
            <span className="voter-nav-icon">
              <i className={icons[index]} aria-hidden="true" />
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="voter-status-card">
        <div className="voter-status-title">
          <span>
            <i className="ri-time-line" aria-hidden="true" />
          </span>
          <p>Election Status</p>
        </div>
        <p className="voter-status-text">Live data from backend</p>
        <p className="voter-status-time">Stay tuned</p>
      </div>
    </aside>
  );
}
