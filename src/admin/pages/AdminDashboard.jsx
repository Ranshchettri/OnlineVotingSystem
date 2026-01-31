import { useState } from "react";
import "../../styles/theme.css";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const [stats] = useState({
    totalElections: 3,
    totalVoters: 1250,
    activeParties: 6,
    totalVotes: 890,
  });

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Election Dashboard</h1>
          <p className="subtitle">Welcome back, Admin</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">+ New Election</button>
          <button className="btn btn-secondary">+ Add Party</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card highlight">
          <div className="stat-icon">🗳️</div>
          <h3>Total Elections</h3>
          <span className="stat-value">{stats.totalElections}</span>
          <p className="stat-change">+2 this month</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>Total Voters</h3>
          <span className="stat-value">{stats.totalVoters}</span>
          <p className="stat-change">+45 this week</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏛️</div>
          <h3>Active Parties</h3>
          <span className="stat-value">{stats.activeParties}</span>
          <p className="stat-change">3 registered today</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <h3>Total Votes</h3>
          <span className="stat-value">{stats.totalVotes}</span>
          <p className="stat-change">71.2% participation</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <button className="action-btn">
            <span className="action-icon">📋</span>
            <span>Manage Elections</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🏛️</span>
            <span>Manage Parties</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">👥</span>
            <span>Manage Voters</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>View Results</span>
          </button>
        </div>
      </div>
    </div>
  );
}
