import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../../services/api";
import { getPartyLogoSrc, getPartyShortLabel } from "../../shared/utils/partyDisplay";
import { usePartyData } from "../hooks/usePartyData";

const navItems = [
  { label: "Home ", path: "/party/home", icon: "ri-home-line" },
  { label: "About", path: "/party/about", icon: "ri-information-line" },
  { label: "Progress", path: "/party/progress", icon: "ri-bar-chart-box-line" },
  { label: "Past Performance", path: "/party/performance", icon: "ri-history-line" },
  { label: "Current Election Stats", path: "/party/stats", icon: "ri-line-chart-line" },
  { label: "Notifications", path: "/party/notifications", icon: "ri-notification-3-line" },
  { label: "Rules", path: "/party/rules", icon: "ri-file-list-line" },
];

export default function PartySidebar() {
  const { party } = usePartyData();
  const [deadline, setDeadline] = useState({
    note: "Profile editing closes 24 hours before election.",
    time: "Loading...",
  });

  useEffect(() => {
    const compute = (startDate) => {
      if (!startDate) {
        return {
          note: "Profile editing closes 24 hours before election.",
          time: "Election schedule pending",
        };
      }

      const lockAt = new Date(startDate).getTime() - 24 * 60 * 60 * 1000;
      const diff = lockAt - Date.now();
      if (!Number.isFinite(diff) || diff <= 0) {
        return {
          note: "Profile editing closes 24 hours before election.",
          time: "Editing locked",
        };
      }

      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      if (days > 0) {
        return {
          note: "Profile editing closes 24 hours before election.",
          time: `${days} day${days > 1 ? "s" : ""} remaining`,
        };
      }
      return {
        note: "Profile editing closes 24 hours before election.",
        time: `${Math.max(hours, 1)} hour${hours > 1 ? "s" : ""} remaining`,
      };
    };

    const load = async () => {
      try {
        const res = await api.get("/parties/current-stats");
        const startDate = res.data?.data?.currentElection?.startDate || null;
        setDeadline(compute(startDate));
      } catch {
        setDeadline({
          note: "Profile editing closes 24 hours before election.",
          time: "Unable to load deadline",
        });
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const logoSrc = getPartyLogoSrc(party);
  const short = getPartyShortLabel(party, "P");
  const normalizedStatus = String(party?.status || "active").toLowerCase();
  const statusText =
    normalizedStatus === "active"
      ? "Active Party"
      : normalizedStatus === "pending"
        ? "Pending Approval"
        : "Blocked";

  return (
    <aside className="party-sidebar">
      <div className="party-sidebar-head">
        <div className="party-logo-mini">
          {logoSrc ? (
            <img src={logoSrc} alt={party?.name || "Party logo"} />
          ) : (
            <span className="party-logo-mini-text">{short}</span>
          )}
        </div>
        <div>
          <div className="party-sidebar-title">{party?.name || "Party"}</div>
          <div className="party-sidebar-sub">{statusText}</div>
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
        <p>{deadline.note}</p>
        <p className="party-deadline-time">
          <i className="ri-time-line" aria-hidden="true" /> {deadline.time}
        </p>
      </div>
    </aside>
  );
}
