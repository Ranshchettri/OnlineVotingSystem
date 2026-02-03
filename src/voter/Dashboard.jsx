import { useEffect, useState } from "react";
import { getVoterDashboard } from "../api/voterApi";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    getVoterDashboard()
      .then((res) => setData(res.data?.data || res.data))
      .catch((err) => {
        console.error("Failed to fetch dashboard:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (!data) return <p className="error">Failed to load dashboard</p>;

  return (
    <div>
      <div className="grid">
        <div className="card highlight">
          <h4>Active Election</h4>
          <h2>{data.electionTitle || "None"}</h2>
        </div>

        <div className="card">
          <h4>Status</h4>
          <h2>{data.status || "Pending"}</h2>
        </div>

        <div className="card">
          <h4>Total Candidates</h4>
          <h2>{data.totalCandidates || 0}</h2>
        </div>

        <div className="card">
          <h4>Your Votes</h4>
          <h2>{data.votesCount || 0}</h2>
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        {data.status === "ACTIVE" && (
          <button
            onClick={() => nav("/voter/vote")}
            className="btn btn-primary"
          >
            Cast Your Vote
          </button>
        )}
        <button onClick={() => nav("/voter/results")} className="btn">
          View Results
        </button>
      </div>
    </div>
  );
}
