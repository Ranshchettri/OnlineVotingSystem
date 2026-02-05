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
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    },
    {
      title: "Active Voters",
      value: "2,654,128",
      delta: "+8.3% vs last election",
      color: "green",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
          <path d="M18 13l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "Voted",
      value: "68.4%",
      delta: "+15.2% vs last election",
      color: "purple",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "Total Parties",
      value: "47",
      delta: "+3 vs last election",
      color: "amber",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h12l4 4v12H4z" />
          <path d="M8 12h8M8 16h8" />
        </svg>
      ),
    },
    {
      title: "Active Parties",
      value: "42",
      delta: "+2 vs last election",
      color: "teal",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z" />
        </svg>
      ),
    },
    {
      title: "Pending Approvals",
      value: "156",
      delta: "-24 vs last election",
      color: "red",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
    },
  ];

  const analyticsCount = analytics.length;
  const activities = [
    ...(analyticsCount
      ? [
          {
            title: "Analytics synced",
            meta: `${analyticsCount} candidates`,
            time: "just now",
            color: "blue",
          },
        ]
      : []),
    { title: "New voter registered", meta: "Ram Bahadur Thapa", time: "2 mins ago", color: "green" },
    { title: "Party verified", meta: "Nepal Communist Party", time: "15 mins ago", color: "blue" },
    { title: "Vote cast", meta: "Voter #284739", time: "23 mins ago", color: "purple" },
    { title: "Voter approved", meta: "Sita Kumari Sharma", time: "1 hour ago", color: "teal" },
  ];

  const timeline = [
    { title: "Election Started", meta: "March 15, 2025 - 07:00 AM", color: "green" },
    { title: "Current Status", meta: "Voting in progress - 6 hours remaining", color: "blue" },
    { title: "Election Ends", meta: "March 15, 2025 - 05:00 PM", color: "gray" },
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
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
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
          <div className="admin-dashboard__emergency-title">
            Live Emergency Controls
          </div>
          <div className="admin-dashboard__emergency-subtitle">
            Critical system operations - use with caution
          </div>
        </div>
        <div className="admin-dashboard__emergency-actions">
          <button
            className="admin-dashboard__emergency-btn warning"
            onClick={() => setShowShutdown(true)}
          >
            <span>Emergency Shutdown</span>
          </button>
          <button
            className="admin-dashboard__emergency-btn amber"
            onClick={() => setShowForceLogout(true)}
          >
            <span>Force Logout All</span>
          </button>
          <button className="admin-dashboard__emergency-btn success">
            <span>Trigger Results</span>
          </button>
        </div>
      </div>

      <div className="admin-dashboard__lower">
        <div className="admin-card admin-dashboard__activity">
          <div className="card-title">Recent Activities</div>
          <div className="activity-list">
            {activities.map((item) => (
              <div key={item.title} className="activity-item">
                <span className={`activity-dot ${item.color}`} />
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
                <span className={`timeline-dot ${item.color}`} />
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
            <div className="confirm-title">Force Logout All Users</div>
            <div className="confirm-text">
              This will immediately log out all voters and party members from the
              system. Use only in emergency situations.
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
            <div className="confirm-title">Emergency Shutdown</div>
            <div className="confirm-text">
              This will immediately stop the election and prevent all voting.
              This action cannot be undone. Are you sure?
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
