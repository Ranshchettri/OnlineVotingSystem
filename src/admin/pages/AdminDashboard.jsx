import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState([]);
  const [showForceLogout, setShowForceLogout] = useState(false);
  const [showShutdown, setShowShutdown] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/candidates");
        setAnalytics(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setAnalytics([]);
      }
    };

    fetchAnalytics();
  }, []);

  const stats = [
    {
      title: "Total Voters",
      value: "2,847,392",
      delta: "+12.5% vs last election",
      color: "blue",
      icon: "ri-user-line",
    },
    {
      title: "Active Voters",
      value: "2,654,128",
      delta: "+8.3% vs last election",
      color: "green",
      icon: "ri-user-star-line",
    },
    {
      title: "Voted",
      value: "68.4%",
      delta: "+15.2% vs last election",
      color: "purple",
      icon: "ri-checkbox-circle-line",
    },
    {
      title: "Total Parties",
      value: "47",
      delta: "+3 vs last election",
      color: "amber",
      icon: "ri-flag-line",
    },
    {
      title: "Active Parties",
      value: "42",
      delta: "+2 vs last election",
      color: "teal",
      icon: "ri-shield-check-line",
    },
    {
      title: "Pending Approvals",
      value: "156",
      delta: "-24 vs last election",
      color: "red",
      icon: "ri-time-line",
    },
  ];

  const analyticsCount = analytics.length;
  const activities = [
    { title: "New voter registered", meta: "Ram Bahadur Thapa", time: "2 mins ago", color: "green", icon: "ri-user-add-line" },
    { title: "Party verified", meta: "Nepal Communist Party", time: "15 mins ago", color: "blue", icon: "ri-shield-check-line" },
    { title: "Vote cast", meta: "Voter #284739", time: "23 mins ago", color: "purple", icon: "ri-checkbox-circle-line" },
    { title: "Voter approved", meta: "Sita Kumari Sharma", time: "1 hour ago", color: "green", icon: "ri-user-line" },
  ];

  const timeline = [
    { title: "Election Started", meta: "March 15, 2025 - 07:00 AM", color: "green", icon: "ri-play-circle-line" },
    { title: "Current Status", meta: "Voting in progress - 6 hours remaining", color: "blue", icon: "ri-time-line" },
    { title: "Election Ends", meta: "March 15, 2025 - 05:00 PM", color: "gray", icon: "ri-stop-circle-line" },
  ];

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
          <span className="dot" /> Election Running
        </span>
      </div>

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
            {activities.map((item) => (
              <div key={item.title} className="activity-item">
                <span className={`activity-icon ${item.color}`}>
                  <i className={item.icon} aria-hidden="true" />
                </span>
                <div>
                  <div className="activity-title">{item.title}</div>
                  <div className="activity-meta">{item.meta}</div>
                </div>
                <div className="activity-time">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-card admin-dashboard__timeline">
          <div className="card-title">Election Timeline</div>
          <div className="timeline-list">
            {timeline.map((item) => (
              <div key={item.title} className="timeline-item">
                <span className={`timeline-icon ${item.color}`}>
                  <i className={item.icon} aria-hidden="true" />
                </span>
                <div>
                  <div className="timeline-title">{item.title}</div>
                  <div className="timeline-meta">{item.meta}</div>
                </div>
              </div>
            ))}
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
              <button className="admin-button warning">Force Logout</button>
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
              <button className="admin-button primary">Confirm Shutdown</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
