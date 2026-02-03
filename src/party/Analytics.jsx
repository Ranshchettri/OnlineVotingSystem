import { useState, useEffect } from "react";
import { getPartyAnalytics } from "../services/partyService";

export default function Analytics() {
  const [partyAnalyticsData, setPartyAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPartyAnalytics();
        setPartyAnalyticsData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
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
  if (!partyAnalyticsData)
    return (
      <div>
        <p>No data</p>
      </div>
    );
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
