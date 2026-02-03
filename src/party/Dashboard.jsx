import { useState, useEffect } from "react";
import { getPartyDashboard } from "../services/partyService";

export default function PartyDashboard() {
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
      <div>
        <p>Loading...</p>
      </div>
    );
  if (!d)
    return (
      <div>
        <p>No data</p>
      </div>
    );

  return (
    <div>
      <h1>{d.partyName}</h1>
      <h3>{d.electionTitle}</h3>

      <div className="grid">
        <div className="card">
          <p>Status</p>
          <h2>{d.status}</h2>
        </div>

        <div className="card">
          <p>Total Votes</p>
          <h2>{d.votesReceived.toLocaleString()}</h2>
        </div>

        <div className="card">
          <p>Rank</p>
          <h2>
            #{d.rank} / {d.totalParties}
          </h2>
        </div>

        <div className="card">
          <p>Vote %</p>
          <h2>{d.votePercentage}%</h2>
        </div>
      </div>
    </div>
  );
}
