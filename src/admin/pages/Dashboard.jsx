import AdminNavbar from "../components/AdminNavbar";
import "../styles/dashboard.css";

export default function Dashboard() {
  return (
    <>
      <AdminNavbar />
      <div className="dashboard">
        <h1>Admin Dashboard</h1>
        <div className="stats">
          <div className="card">
            <h3>Total Voters</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="card">
            <h3>Total Parties</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="card">
            <h3>Active Election</h3>
            <p className="stat-number">0</p>
          </div>
        </div>
      </div>
    </>
  );
}
