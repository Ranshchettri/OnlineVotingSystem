import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import RankBadge from "../components/RankBadge";
import VotesChart from "../components/VotesChart";
import Card from "../../shared/ui/Card";
import { getPartyDashboard } from "../../services/partyService";

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPartyDashboard();
        setD(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
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
  if (!d)
    return (
      <div className="page-content">
        <p>No dashboard data</p>
      </div>
    );

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time election performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Votes" value={d.votes.toLocaleString()} icon="🗳️" />
        <StatCard title="Rank" value={`#${d.rank}`} icon="🥇" />
        <StatCard title="Trend" value={d.trend} icon="📈" />
        <StatCard title="Status" value={d.status} icon="⏳" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <VotesChart data={d.timeline} />

        <Card className="info-card">
          <h3>Election Info</h3>
          <div className="space-y-2">
            <p>
              <strong>Election:</strong> {d.electionTitle}
            </p>
            <p>
              <strong>Total Parties:</strong> {d.totalParties}
            </p>
            <div className="mt-4">
              <RankBadge rank={d.rank} total={d.totalParties} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
