import { partyAnalytics } from "../mock/party.mock";
import Card from "../../../shared/ui/Card";
import Badge from "../../../shared/ui/Badge";

export default function Analytics() {
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
