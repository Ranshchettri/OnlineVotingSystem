import { NavLink } from "react-router-dom";
import { electionOverview, voterProfile } from "../data/fakeVoterData";

const navItems = [
  { label: "Election Overview", path: "/voter/dashboard" },
  { label: "My Profile", path: "/voter/profile" },
  { label: "Results", path: "/voter/results" },
  { label: "Election Timeline", path: "/voter/timeline" },
  { label: "Rules & How-To", path: "/voter/rules" },
];

const icons = [
  () => (
    <svg
      viewBox="0 0 24 24"
      className="voter-nav-svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  () => (
    <svg
      viewBox="0 0 24 24"
      className="voter-nav-svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21c1.8-4 5-6 8-6s6.2 2 8 6" />
    </svg>
  ),
  () => (
    <svg
      viewBox="0 0 24 24"
      className="voter-nav-svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 20V8" />
      <path d="M12 20V4" />
      <path d="M17 20v-6" />
    </svg>
  ),
  () => (
    <svg
      viewBox="0 0 24 24"
      className="voter-nav-svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
  () => (
    <svg
      viewBox="0 0 24 24"
      className="voter-nav-svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
    </svg>
  ),
];

export default function Sidebar() {
  return (
    <aside className="voter-sidebar">
      <div className="voter-sidebar-header">
        <div className="voter-avatar">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
            <path d="M4 20c1.5-3.5 5-5 8-5s6.5 1.5 8 5" />
          </svg>
        </div>
        <div>
          <p className="voter-profile-name">{voterProfile.name}</p>
          <p className="voter-profile-id">ID: {voterProfile.id}</p>
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
            <span className="voter-nav-icon">{icons[index]()}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="voter-status-card">
        <div className="voter-status-title">
          <span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          <p>{electionOverview.statusTitle}</p>
        </div>
        <p className="voter-status-text">{electionOverview.statusText}</p>
        <p className="voter-status-time">{electionOverview.statusEnds}</p>
      </div>
    </aside>
  );
}
