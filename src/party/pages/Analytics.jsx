import { useState, useEffect } from "react";
import Card from "../../shared/ui/Card";
import Badge from "../../shared/ui/Badge";
import { getPartyAnalytics } from "../../services/partyService";

export default function Analytics() {
  const [partyAnalytics, setPartyAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPartyAnalytics();
        setPartyAnalytics(res.data);
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
      <div className="page-content">
        <p>Loading...</p>
      </div>
    );
  if (!partyAnalytics)
    return (
      <div className="page-content">
        <p>No analytics data</p>
      </div>
    );
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Complete ranking and comparison</p>
      </div>

      <Card>
        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Party</th>
                <th>Votes</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {partyAnalytics.ranks.map((r, idx) => (
                <tr key={r.rank} className={idx === 1 ? "highlight" : ""}>
                  <td>
                    <Badge>{r.rank}</Badge>
                  </td>
                  <td>{r.name}</td>
                  <td>{r.votes.toLocaleString()}</td>
                  <td>
                    {(
                      (r.votes /
                        partyAnalytics.ranks.reduce(
                          (sum, x) => sum + x.votes,
                          0,
                        )) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
