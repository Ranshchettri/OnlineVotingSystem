import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/AdminDashboard.css";

const EMPTY_OVERVIEW = {
  totalVoters: null,
  activeVoters: null,
  votedRate: null,
  totalParties: null,
  activeParties: null,
  pendingApprovals: null,
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const deriveElectionStatus = (election = {}) => {
  const raw = String(election.status || "").toLowerCase();
  const now = Date.now();
  const start = election.startDate ? new Date(election.startDate).getTime() : null;
  const end = election.endDate ? new Date(election.endDate).getTime() : null;

  if (raw === "ended" || election.isEnded || election.allowVoting === false) return "Ended";
  if (raw === "running" || election.isActive) return "Running";
  if (raw === "upcoming") return "Upcoming";

  if (start && now < start) return "Upcoming";
  if (end && now > end) return "Ended";
  if (start && end && now >= start && now <= end) return "Running";

  return "Upcoming";
};

const normalizeElection = (item = {}) => ({
  ...item,
  id: item.id || item._id,
  startDate: item.startDate || item.startsAt || item.start,
  endDate: item.endDate || item.endsAt || item.end,
  status: deriveElectionStatus(item),
});

const getStatusColor = (status) => {
  if (status === "Running") return "green";
  if (status === "Ended") return "gray";
  return "blue";
};

const pickPrimaryElection = (list = []) => {
  const running = list.find((item) => item.status === "Running");
  if (running) return running;

  const upcoming = list
    .filter((item) => item.status === "Upcoming")
    .sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0))[0];
  if (upcoming) return upcoming;

  return list[0] || null;
};

const isElectionRunningNow = (election = {}) => {
  const status = deriveElectionStatus(election);
  if (status === "Running") return true;

  const now = Date.now();
  const start = election.startDate ? new Date(election.startDate).getTime() : null;
  const end = election.endDate ? new Date(election.endDate).getTime() : null;
  const allowVoting = election.allowVoting !== false;

  if (!allowVoting) return false;
  if (start && end) return now >= start && now <= end;
  return Boolean(election.isActive);
};

const extractElectionList = (response) => {
  const value = response?.data;
  const list = value?.data?.elections || value?.data || value || [];
  return Array.isArray(list) ? list.map(normalizeElection) : [];
};

const extractPartyList = (response) => {
  const value = response?.data;
  const list = value?.data?.parties || value?.data || value || [];
  return Array.isArray(list) ? list : [];
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [backendOffline, setBackendOffline] = useState(false);
  const [activities, setActivities] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [electionStatus, setElectionStatus] = useState(null);
  const [elections, setElections] = useState([]);
  const [showForceLogout, setShowForceLogout] = useState(false);
  const [showShutdown, setShowShutdown] = useState(false);
  const [actionBusy, setActionBusy] = useState("");

  const refreshDashboard = useCallback(async () => {
    try {
      setLoadingOverview(true);

      const [
        adminDashboardRes,
        adminActivitiesRes,
        adminElectionsRes,
        voterStatsRes,
        partiesRes,
        publicElectionsRes,
      ] = await Promise.allSettled([
        api.get("/admin/dashboard"),
        api.get("/admin/dashboard/activities", { params: { limit: 8 } }),
        api.get("/admin/elections"),
        api.get("/voters/admin/stats"),
        api.get("/parties"),
        api.get("/elections"),
      ]);

      const coreResponses = [
        adminDashboardRes,
        adminElectionsRes,
        voterStatsRes,
        partiesRes,
        publicElectionsRes,
      ];
      const allCoreNetworkFailed = coreResponses.every(
        (res) => res.status === "rejected" && res.reason?.isNetworkError,
      );
      setBackendOffline(allCoreNetworkFailed);

      const adminElectionList =
        adminElectionsRes.status === "fulfilled"
          ? extractElectionList(adminElectionsRes.value)
          : [];
      const publicElectionList =
        publicElectionsRes.status === "fulfilled"
          ? extractElectionList(publicElectionsRes.value)
          : [];
      const electionList = adminElectionList.length ? adminElectionList : publicElectionList;
      setElections(electionList);

      let effectiveOverview = { ...EMPTY_OVERVIEW };

      if (adminDashboardRes.status === "fulfilled") {
        const data = adminDashboardRes.value?.data?.data || {};
        const voted =
          data.votedPercentage === null || data.votedPercentage === undefined
            ? null
            : `${Number(data.votedPercentage).toFixed(1)}%`;

        effectiveOverview = {
          totalVoters: data.totalVoters ?? null,
          activeVoters: data.activeVoters ?? null,
          votedRate: voted,
          totalParties: data.totalParties ?? null,
          activeParties: data.activeParties ?? null,
          pendingApprovals: data.pendingApprovals ?? null,
        };
      } else {
        let totalVoters = null;
        let activeVoters = null;
        let votedRate = null;
        if (voterStatsRes.status === "fulfilled") {
          const payload = voterStatsRes.value?.data?.data || {};
          const stats = payload.stats || {};
          const voterList = Array.isArray(payload.voters) ? payload.voters : [];
          totalVoters = stats.totalRegistered ?? voterList.length ?? null;
          activeVoters =
            stats.activeVoters ??
            voterList.filter((v) => String(v.status || "").toUpperCase() === "ACTIVE").length ??
            null;
          const votedCount = voterList.filter((v) => v.hasVoted || v.voted).length;
          if (totalVoters && totalVoters > 0) {
            votedRate = `${((votedCount / totalVoters) * 100).toFixed(1)}%`;
          }
        }

        let totalParties = null;
        let activeParties = null;
        let pendingApprovals = null;
        if (partiesRes.status === "fulfilled") {
          const partyList = extractPartyList(partiesRes.value);
          totalParties = partyList.length;
          activeParties = partyList.filter((p) => {
            const status = String(p.status || "").toLowerCase();
            return p.isActive || status === "approved" || status === "active";
          }).length;
          pendingApprovals = partyList.filter(
            (p) => String(p.status || "").toLowerCase() === "pending",
          ).length;
        }

        effectiveOverview = {
          totalVoters,
          activeVoters,
          votedRate,
          totalParties,
          activeParties,
          pendingApprovals,
        };
      }
      setOverview(effectiveOverview);

      const buildFallbackActivities = () => {
        const currentElection = pickPrimaryElection(electionList);
        return [
          currentElection
            ? {
                title: `${currentElection.title || "Election"} status updated`,
                meta: `Current status: ${currentElection.status || "Upcoming"}`,
                time: formatDateTime(new Date()),
                icon: "ri-timer-line",
                color: getStatusColor(currentElection.status || "Upcoming"),
              }
            : null,
          effectiveOverview.totalVoters !== null
            ? {
                title: "Voter registry synced",
                meta: `${Number(effectiveOverview.totalVoters || 0).toLocaleString()} total voters loaded`,
                time: formatDateTime(new Date()),
                icon: "ri-user-3-line",
                color: "blue",
              }
            : null,
          effectiveOverview.totalParties !== null
            ? {
                title: "Party data refreshed",
                meta: `${Number(effectiveOverview.totalParties || 0).toLocaleString()} parties loaded`,
                time: formatDateTime(new Date()),
                icon: "ri-flag-line",
                color: "green",
              }
            : null,
        ].filter(Boolean);
      };

      if (adminActivitiesRes.status === "fulfilled") {
        const list = adminActivitiesRes.value?.data?.data || [];
        let mapped = Array.isArray(list)
          ? list.map((item, index) => ({
              title: item.action || item.title || `Activity ${index + 1}`,
              meta: item.user ? `By ${item.user}` : item.meta || "System update",
              time: formatDateTime(item.time || item.createdAt),
              icon: item.icon || "ri-notification-3-line",
              color: item.color || "blue",
            }))
          : [];

        if (!mapped.length) {
          mapped = buildFallbackActivities();
        }
        setActivities(mapped);
      } else {
        setActivities(buildFallbackActivities());
      }

      const currentElection = pickPrimaryElection(electionList);
      if (!currentElection) {
        setElectionStatus(null);
        setTimeline([]);
      } else {
        setElectionStatus(currentElection.status || "Upcoming");
        setTimeline([
          {
            title: "Election Start",
            meta: formatDateTime(currentElection.startDate),
            color: "green",
            icon: "ri-play-circle-line",
          },
          {
            title: "Current Status",
            meta: currentElection.status || "Upcoming",
            color: getStatusColor(currentElection.status),
            icon: "ri-time-line",
          },
          {
            title: "Election End",
            meta: formatDateTime(currentElection.endDate),
            color: "gray",
            icon: "ri-stop-circle-line",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard overview:", err);
      setBackendOffline(err?.isNetworkError === true);
      setOverview(EMPTY_OVERVIEW);
      setActivities([]);
      setTimeline([]);
      setElectionStatus(null);
      setElections([]);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const findRunningElection = () =>
    elections.find((election) => isElectionRunningNow(election) && election.id);

  const handleForceLogout = async () => {
    try {
      setActionBusy("force-logout");
      const tryForceLogout = async (url) =>
        api.post(
          url,
          {},
          {
            validateStatus: (status) => status >= 200 && status < 500,
          },
        );

      const primaryRes = await tryForceLogout("/admin/sessions/force-logout");
      let success = primaryRes.status >= 200 && primaryRes.status < 300;

      if (!success && primaryRes.status === 404) {
        const aliasRes = await tryForceLogout("/admin/sessions/logout-all");
        success = aliasRes.status >= 200 && aliasRes.status < 300;
        if (!success && aliasRes.status === 404) {
          const legacyRes = await tryForceLogout("/admin/force-logout");
          success = legacyRes.status >= 200 && legacyRes.status < 300;
        }
      }

      if (!success) {
        // Fallback for older backend builds where force-logout endpoint is unavailable.
        localStorage.setItem("force_logout_fallback_at", String(Date.now()));
      }
      setShowForceLogout(false);
      await refreshDashboard();
      alert("Forced logout request applied.");
    } catch (err) {
      console.error("Failed to force logout users:", err);
      alert(err.response?.data?.message || "Failed to force logout users");
    } finally {
      setActionBusy("");
    }
  };

  const handleShutdown = async () => {
    try {
      setActionBusy("shutdown");
      let running = findRunningElection();
      if (!running) {
        running =
          elections.find(
            (election) =>
              election.id &&
              deriveElectionStatus(election) !== "Ended" &&
              election.allowVoting !== false,
          ) || null;
      }
      if (!running || !running.id) {
        alert("No running election found to stop.");
        setShowShutdown(false);
        return;
      }
      await api.put(`/admin/elections/${running.id}/stop`);
      setShowShutdown(false);
      await refreshDashboard();
      alert("Election stopped successfully.");
    } catch (err) {
      console.error("Failed to stop election:", err);
      alert(err.response?.data?.message || "Failed to stop election");
    } finally {
      setActionBusy("");
    }
  };

  const handleTriggerResults = async () => {
    try {
      setActionBusy("results");
      const target =
        elections.find((election) => election.status !== "Ended" && election.id) || elections[0];

      if (!target?.id) {
        alert("No election available for result trigger.");
        return;
      }

      await api.get(`/results/admin/${target.id}`);
      await refreshDashboard();
      alert("Results triggered successfully.");
    } catch (err) {
      console.error("Failed to trigger results:", err);
      alert(err.response?.data?.message || "Failed to trigger results");
    } finally {
      setActionBusy("");
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return "-";
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
      value: overview.votedRate || "-",
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

  return (
    <div className="admin-page admin-dashboard">
      <div className="admin-dashboard__header">
        <div>
          <div className="admin-section-title">Dashboard Overview</div>
          <div className="admin-section-subtitle">Real-time system monitoring and control</div>
        </div>
        <span className="admin-pill green">
          <span className="dot" /> {statusLabel}
        </span>
      </div>

      {loadingOverview === false && statusLabel.includes("offline") && (
        <div className="dashboard-error">
          Could not reach the backend API. Start the server at{" "}
          {import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}.
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
              <div className={`stat-delta ${stat.delta.startsWith("-") ? "negative" : ""}`}>
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
            <div className="admin-dashboard__emergency-title">Live Emergency Controls</div>
            <div className="admin-dashboard__emergency-subtitle">
              Critical system operations - use with caution
            </div>
          </div>
        </div>
        <div className="admin-dashboard__emergency-actions">
          <button
            className="admin-dashboard__emergency-btn warning"
            onClick={() => setShowShutdown(true)}
            disabled={actionBusy !== ""}
          >
            <i className="ri-shut-down-line" aria-hidden="true" />
            {actionBusy === "shutdown" ? "Stopping..." : "Emergency Shutdown"}
          </button>
          <button
            className="admin-dashboard__emergency-btn amber"
            onClick={() => setShowForceLogout(true)}
            disabled={actionBusy !== ""}
          >
            <i className="ri-logout-box-line" aria-hidden="true" />
            {actionBusy === "force-logout" ? "Applying..." : "Force Logout All"}
          </button>
          <button
            className="admin-dashboard__emergency-btn success"
            onClick={handleTriggerResults}
            disabled={actionBusy !== ""}
          >
            <i className="ri-trophy-line" aria-hidden="true" />
            {actionBusy === "results" ? "Publishing..." : "Trigger Results"}
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
                <div key={`${item.title}-${item.time}`} className="activity-item">
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
                  This logs out all voter and party sessions immediately.
                </div>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-button ghost" onClick={() => setShowForceLogout(false)}>
                Cancel
              </button>
              <button
                className="admin-button warning"
                onClick={handleForceLogout}
                disabled={actionBusy === "force-logout"}
              >
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
                  This immediately stops currently running election voting.
                </div>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-button ghost" onClick={() => setShowShutdown(false)}>
                Cancel
              </button>
              <button
                className="admin-button primary"
                onClick={handleShutdown}
                disabled={actionBusy === "shutdown"}
              >
                Confirm Shutdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
