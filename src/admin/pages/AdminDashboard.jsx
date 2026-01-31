import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="stat-grid">
        <div className="stat-card highlight">
          <h3>Total Elections</h3>
          <span>3</span>
        </div>

        <div className="stat-card">
          <h3>Total Voters</h3>
          <span>120</span>
        </div>

        <div className="stat-card">
          <h3>Active Parties</h3>
          <span>6</span>
        </div>
      </div>
    </div>
  );
}
