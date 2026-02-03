import { useState, useEffect } from "react";
import ElectionCard from "../components/ElectionCard";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import { useNavigate } from "react-router-dom";
import { getVoterDashboard } from "../../services/voterService";

export default function Home() {
  const [activeElection, setActiveElection] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getVoterDashboard();
        setActiveElection(res.data?.activeElection || null);
        setStats(res.data?.stats || null);
      } catch (err) {
        console.error("Failed to fetch voter dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="page-content">
        <p>Loading...</p>
      </div>
    );
  if (!activeElection || !stats)
    return (
      <div className="page-content">
        <p>No election data</p>
      </div>
    );

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>🗳️ Voting Portal</h1>
        <p>Participate in the democratic process</p>
      </div>

      <ElectionCard election={activeElection} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="stat-content">
            <span className="stat-icon">👥</span>
            <div>
              <p className="stat-title">Total Voters</p>
              <h3 className="stat-value">
                {stats.totalVoters.toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="stat-content">
            <span className="stat-icon">🏛️</span>
            <div>
              <p className="stat-title">Parties</p>
              <h3 className="stat-value">{stats.parties}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="stat-content">
            <span className="stat-icon">📊</span>
            <div>
              <p className="stat-title">Turnout</p>
              <h3 className="stat-value">{stats.turnout}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="cta-card">
        <h3>Ready to Vote?</h3>
        <p>Select your preferred party and cast your vote.</p>
        <Button onClick={() => nav("/voter/vote")}>Start Voting</Button>
      </Card>
    </div>
  );
}
