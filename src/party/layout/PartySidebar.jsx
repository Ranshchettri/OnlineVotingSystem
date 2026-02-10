import { NavLink } from "react-router-dom";
import { partySidebar } from "../data/fakePartyData";

const navItems = [
  { label: "Home / Profile", path: "/party/home", icon: "ri-home-line" },
  { label: "About", path: "/party/about", icon: "ri-information-line" },
  { label: "Progress", path: "/party/progress", icon: "ri-bar-chart-box-line" },
  { label: "Past Performance", path: "/party/performance", icon: "ri-history-line" },
  { label: "Current Election Stats", path: "/party/stats", icon: "ri-line-chart-line" },
  { label: "Notifications", path: "/party/notifications", icon: "ri-notification-3-line" },
  { label: "Rules", path: "/party/rules", icon: "ri-file-list-line" },
];

export default function PartySidebar() {
  return (
    <aside className="party-sidebar">
      <div className="party-sidebar-head">
        <div className="party-logo-mini">{partySidebar.short}</div>
        <div>
          <div className="party-sidebar-title">{partySidebar.name}</div>
          <div className="party-sidebar-sub">{partySidebar.status}</div>
        </div>
      </div>

      <nav className="party-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `party-nav-link ${isActive ? "is-active" : ""}`
            }
          >
            <span className="party-nav-icon" aria-hidden="true">
              <i className={item.icon} />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="party-deadline">
        <strong className="party-deadline-title">
          <i className="ri-alert-line" aria-hidden="true" />
          Editing Deadline
        </strong>
        <p>Profile editing closes 24 hours before election.</p>
        <p className="party-deadline-time">
          <i className="ri-time-line" aria-hidden="true" /> 3 days remaining
        </p>
      </div>
    </aside>
  );
}
