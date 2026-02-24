import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const [overview, setOverview] = useState({
    totalVoters: null,
    activeVoters: null,
    votedRate: null,
    totalParties: null,
    activeParties: null,
    pendingApprovals: null,
  });
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [backendOffline, setBackendOffline] = useState(false);
  const [activities, setActivities] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [electionStatus, setElectionStatus] = useState(null);
  const [showForceLogout, setShowForceLogout] = useState(false);
  const [showShutdown, setShowShutdown] = useState(false);

  useEffect(() => {
    const formatDateTime = (value) => {
      if (!value) return "—";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "—";
      return date.toLocaleString();
    };

    const fetchOverview = async () => {
      try {
        setLoadingOverview(true);
        const [voterRes, partyRes, electionRes] = await Promise.allSettled([
          api.get("/voters/admin/stats"),
          api.get("/parties"),
          api.get("/elections"),
        ]);
        const offline =
          (voterRes.status === "rejected" && voterRes.reason?.isNetworkError) ||
          (partyRes.status === "rejected" && partyRes.reason?.isNetworkError) ||
          (electionRes.status === "rejected" && electionRes.reason?.isNetworkError);
        setBackendOffline(offline);

        let totalVoters = null;
        let activeVoters = null;
        let votedRate = null;
        if (voterRes.status === "fulfilled") {
          const payload = voterRes.value.data?.data || {};
          const statsData = payload.stats || {};
          const voterList = Array.isArray(payload.voters) ? payload.voters : [];
          totalVoters = statsData.totalRegistered ?? voterList.length ?? null;
          activeVoters =
            statsData.activeVoters ??
            voterList.filter((v) => v.status === "ACTIVE").length ??
            null;
          const votedCount = voterList.filter((v) => v.hasVoted || v.voted).length;
          if (totalVoters) {
            votedRate =
              totalVoters > 0 ? `${((votedCount / totalVoters) * 100).toFixed(1)}%` : null;
          }
          setActivities(
            Array.isArray(payload.activities) ? payload.activities : [],
          );
        }

        let totalParties = null;
        let activeParties = null;
        let pendingApprovals = null;
        if (partyRes.status === "fulfilled") {
          const partyList =
            partyRes.value.data?.data?.parties ||
            partyRes.value.data?.data ||
            partyRes.value.data ||
            [];
          if (Array.isArray(partyList)) {
            totalParties = partyList.length;
            activeParties = partyList.filter(
              (p) => p.status === "Active" || p.status === "APPROVED" || p.isActive,
            ).length;
            pendingApprovals = partyList.filter((p) => p.status === "PENDING").length;
          }
        }

        let timelineItems = [];
        if (electionRes.status === "fulfilled") {
          const list =
            electionRes.value.data?.data?.elections ||
            electionRes.value.data?.data ||
            electionRes.value.data ||
            [];
          if (Array.isArray(list) && list.length) {
            const current =
              list.find((e) => (e.status || "").toLowerCase() === "running") || list[0];
            if (current) {
              setElectionStatus(current.status || "Status unavailable");
              timelineItems = [
                {
                  title: "Election Start",
                  meta: formatDateTime(current.startDate) || "Pending date",
                  color: "green",
                  icon: "ri-play-circle-line",
                },
                {
                  title: "Current Status",
                  meta: current.status || "Unknown",
                  color: "blue",
                  icon: "ri-time-line",
                },
                {
                  title: "Election End",
                  meta: formatDateTime(current.endDate) || "Pending date",
                  color: "gray",
                  icon: "ri-stop-circle-line",
                },
              ];
            }
          }
        }

        setOverview({
          totalVoters,
          activeVoters,
          votedRate,
          totalParties,
          activeParties,
          pendingApprovals,
        });
        setTimeline(timelineItems);
      } catch (err) {
        console.error("Failed to fetch dashboard overview:", err);
        setBackendOffline(err.isNetworkError === true);
        setOverview({
          totalVoters: null,
          activeVoters: null,
          votedRate: null,
          totalParties: null,
          activeParties: null,
          pendingApprovals: null,
        });
        setTimeline([]);
      } finally {
        setLoadingOverview(false);
      }
    };

    fetchOverview();
  }, []);

  const formatValue = (value) => {
    if (value === null || value === undefined) return "—";
    return typeof value === "number" ? value.toLocaleString() : value;
  };

  const stats = [
    {
      title: "Total Voters",
      value: formatValue(overview.totalVoters),
      delta: overview.totalVoters === null ? "Awaiting data" : "",
      color: "blue",
      icon: "ri-user-line",
    },
    {
      title: "Active Voters",
      value: formatValue(overview.activeVoters),
      delta: overview.activeVoters === null ? "Awaiting data" : "",
      color: "green",
      icon: "ri-user-star-line",
    },
    {
      title: "Voted",
      value: overview.votedRate || "—",
      delta: overview.votedRate ? "" : "Awaiting data",
      color: "purple",
      icon: "ri-checkbox-circle-line",
    },
    {
      title: "Total Parties",
      value: formatValue(overview.totalParties),
      delta: overview.totalParties === null ? "Awaiting data" : "",
      color: "amber",
      icon: "ri-flag-line",
    },
    {
      title: "Active Parties",
      value: formatValue(overview.activeParties),
      delta: overview.activeParties === null ? "Awaiting data" : "",
      color: "teal",
      icon: "ri-shield-check-line",
    },
    {
      title: "Pending Approvals",
      value: formatValue(overview.pendingApprovals),
      delta: overview.pendingApprovals === null ? "Awaiting data" : "",
      color: "red",
      icon: "ri-time-line",
    },
  ];
  const statusLabel = loadingOverview
    ? "Syncing data..."
    : backendOffline
      ? "API offline"
      : electionStatus || "Preview mode";

  const handleForceLogout = () => {
    setShowForceLogout(false);
    alert("Force logout triggered. Wire this to backend endpoint.");
  };

  const handleShutdown = () => {
    setShowShutdown(false);
    alert("Emergency shutdown triggered. Wire this to backend endpoint.");
  };

  return (
    <div className="admin-page admin-dashboard">
      <div className="admin-dashboard__header">
        <div>
          <div className="admin-section-title">Dashboard Overview</div>
          <div className="admin-section-subtitle">
            Real-time system monitoring and control
          </div>
        </div>
        <span className="admin-pill green">
          <span className="dot" /> {statusLabel}
        </span>
      </div>

      {loadingOverview === false && statusLabel.includes("offline") && (
        <div className="dashboard-error">
          Could not reach the backend API. Start the server at {import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}.
        </div>
      )}

     <div className="admin-dashboard__stats">
        {stats.map((stat) => (
          <div key={stat.title} className="admin-dashboard__stat-card">
            <div className={`stat-icon ${stat.color}`}>
              <i className={stat.icon} aria-hidden="true" />
            </div>
            <div className="stat-meta">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
              <div
                className={`stat-delta ${stat.delta.startsWith("-") ? "negative" : ""}`}
              >
                {stat.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard__emergency">
        <div className="admin-dashboard__emergency-header">
          <div className="emergency-icon">
            <i className="ri-alarm-warning-line" aria-hidden="true" />
          </div>
          <div>
            <div className="admin-dashboard__emergency-title">
              Live Emergency Controls
            </div>
            <div className="admin-dashboard__emergency-subtitle">
              Critical system operations - use with caution
            </div>
          </div>
        </div>
            <div className="admin-dashboard__emergency-actions">
              <button
                className="admin-dashboard__emergency-btn warning"
                onClick={() => setShowShutdown(true)}
              >
                <i className="ri-shut-down-line" aria-hidden="true" />
                Emergency Shutdown
              </button>
              <button
                className="admin-dashboard__emergency-btn amber"
                onClick={() => setShowForceLogout(true)}
              >
                <i className="ri-logout-box-line" aria-hidden="true" />
                Force Logout All
              </button>
              <button className="admin-dashboard__emergency-btn success">
                <i className="ri-trophy-line" aria-hidden="true" />
                Trigger Results
              </button>
        </div>
      </div>

      <div className="admin-dashboard__lower">
        <div className="admin-card admin-dashboard__activity">
          <div className="card-title">Recent Activities</div>
          <div className="activity-list">
            {activities.length === 0 ? (
              <div className="dashboard-empty">
                <i className="ri-inbox-line" aria-hidden="true" />
                <div>No activity to display yet</div>
              </div>
            ) : (
              activities.map((item) => (
                <div key={item.title} className="activity-item">
                  <span className={`activity-icon ${item.color || "blue"}`}>
                    <i className={item.icon || "ri-notification-3-line"} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="activity-title">{item.title}</div>
                    <div className="activity-meta">{item.meta}</div>
                  </div>
                  <div className="activity-time">{item.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="admin-card admin-dashboard__timeline">
          <div className="card-title">Election Timeline</div>
          <div className="timeline-list">
            {timeline.length === 0 ? (
              <div className="dashboard-empty">
                <i className="ri-time-line" aria-hidden="true" />
                <div>No timeline data available</div>
              </div>
            ) : (
              timeline.map((item) => (
                <div key={item.title} className="timeline-item">
                  <span className={`timeline-icon ${item.color}`}>
                    <i className={item.icon} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="timeline-title">{item.title}</div>
                    <div className="timeline-meta">{item.meta}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showForceLogout && (
        <div className="admin-modal-backdrop" onClick={() => setShowForceLogout(false)}>
          <div className="admin-modal admin-dashboard__confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-head">
              <span className="confirm-icon orange">
                <i className="ri-logout-circle-line" aria-hidden="true" />
              </span>
              <div>
                <div className="confirm-title">Force Logout All Users</div>
                <div className="confirm-text">
                  This will immediately log out all voters and party members from
                  the system. Use only in emergency situations.
                </div>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-button ghost" onClick={() => setShowForceLogout(false)}>
                Cancel
              </button>
              <button className="admin-button warning" onClick={handleForceLogout}>
                Force Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showShutdown && (
        <div className="admin-modal-backdrop" onClick={() => setShowShutdown(false)}>
          <div className="admin-modal admin-dashboard__confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-head">
              <span className="confirm-icon red">
                <i className="ri-alarm-warning-line" aria-hidden="true" />
              </span>
              <div>
                <div className="confirm-title">Emergency Shutdown</div>
                <div className="confirm-text">
                  This will immediately stop the election and prevent all voting.
                  This action cannot be undone. Are you sure?
                </div>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-button ghost" onClick={() => setShowShutdown(false)}>
                Cancel
              </button>
              <button className="admin-button primary" onClick={handleShutdown}>
                Confirm Shutdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
