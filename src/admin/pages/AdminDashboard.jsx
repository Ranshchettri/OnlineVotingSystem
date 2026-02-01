import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/analytics/candidates");
        setAnalytics(res.data.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics data");
        setAnalytics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard - Candidates Analytics</h1>

      {analytics.length === 0 ? (
        <p>No candidate data available</p>
      ) : (
        <div className="analytics-grid">
          {analytics.map((candidate) => (
            <div key={candidate._id} className="analytics-card">
              <h3>{candidate.fullName}</h3>
              <div className="analytics-stat">
                <span className="stat-label">Total Votes:</span>
                <span className="stat-value">{candidate.totalVotes || 0}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Task Completion:</span>
                <span className="stat-value">
                  {candidate.totalTaskCompletion || 0}%
                </span>
              </div>
              {candidate.email && (
                <div className="analytics-stat">
                  <span className="stat-label">Email:</span>
                  <span className="stat-value">{candidate.email}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
