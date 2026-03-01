import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { getStoredVoter } from "../utils/user";
import { getTimeLeft, getTimeUntil, normalizeElectionStatus, pickCurrentElection } from "../utils/election";

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
  const [statusLine, setStatusLine] = useState("Live data from backend");
  const [statusTime, setStatusTime] = useState("Stay tuned");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await api.get("/elections");
        const elections = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        const current = pickCurrentElection(elections);
        const state = normalizeElectionStatus(current);

        if (!current) {
          setStatusLine("No election");
          setStatusTime("Stay tuned");
          return;
        }

        if (state === "running") {
          setStatusLine(`${current.title} is currently active`);
          setStatusTime(`Ends in ${getTimeLeft(current.endDate)}`);
          return;
        }

        if (state === "upcoming") {
          setStatusLine(`${current.title} is upcoming`);
          setStatusTime(getTimeUntil(current.startDate));
          return;
        }

        setStatusLine(`${current.title} has ended`);
        setStatusTime("Results available");
      } catch {
        setStatusLine("Live data unavailable");
        setStatusTime("Stay tuned");
      }
    };

    loadStatus();
  }, []);

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

      <div className="voter-sidebar-divider" />

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

      <div className="voter-sidebar-divider bottom" />

      <div className="voter-status-card">
        <div className="voter-status-title">
          <span>
            <i className="ri-time-line" aria-hidden="true" />
          </span>
          <p>Election Status</p>
        </div>
        <p className="voter-status-text">{statusLine}</p>
        <p className="voter-status-time">{statusTime}</p>
      </div>
    </aside>
  );
}
