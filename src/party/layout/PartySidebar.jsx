import { NavLink } from "react-router-dom";
import { partySidebar } from "../data/fakePartyData";

const navItems = [
  { label: "Home / Profile", path: "/party/home" },
  { label: "About", path: "/party/about" },
  { label: "Progress", path: "/party/progress" },
  { label: "Past Performance", path: "/party/performance" },
  { label: "Current Election Stats", path: "/party/stats" },
  { label: "Notifications", path: "/party/notifications" },
  { label: "Rules", path: "/party/rules" },
];

const icons = [
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10l8-6 8 6v10H4z" />
    </svg>
  ),
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  ),
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20h16" />
      <rect x="6" y="10" width="4" height="6" />
      <rect x="14" y="6" width="4" height="10" />
    </svg>
  ),
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  ),
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
    </svg>
  ),
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 0 1 12 0v4l2 2H4l2-2z" />
      <path d="M9 18h6" />
    </svg>
  ),
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h8" />
    </svg>
  ),
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
        {navItems.map((item, index) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `party-nav-link ${isActive ? "is-active" : ""}`
            }
          >
            <span className="party-nav-icon">{icons[index]()}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="party-deadline">
        <strong>Editing Deadline</strong>
        <p>Profile editing closes 24 hours before election.</p>
        <p>3 days remaining</p>
      </div>
    </aside>
  );
}
