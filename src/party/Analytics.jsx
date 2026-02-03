import { partyAnalyticsData } from "../services/partyFakeData";

export default function Analytics() {
  return (
    <div>
      <h2>Performance Analytics</h2>

      <div className="grid">
        <div className="card good">
          <h3>Good Work</h3>
          <h1>{partyAnalyticsData.goodWork}%</h1>
        </div>

        <div className="card bad">
          <h3>Bad Work</h3>
          <h1>{partyAnalyticsData.badWork}%</h1>
        </div>
      </div>
    </div>
  );
}
