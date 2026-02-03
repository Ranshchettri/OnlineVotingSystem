import { partyDashboardData } from "../services/partyFakeData";

export default function PartyDashboard() {
  const d = partyDashboardData;

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
