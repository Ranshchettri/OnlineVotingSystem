import Card from "../../../shared/ui/Card";

export default function VotesChart({ data }) {
  if (!data || data.length === 0) return <div>No chart data</div>;

  const maxVotes = Math.max(...data.map((d) => d.v));

  return (
    <Card className="chart-card">
      <h3>Vote Timeline</h3>
      <div className="chart-container">
        {data.map((item, idx) => (
          <div key={idx} className="chart-bar">
            <div
              className="bar"
              style={{ height: `${(item.v / maxVotes) * 100}%` }}
            />
            <p className="bar-label">{item.t}</p>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <p>Votes: {data[data.length - 1].v.toLocaleString()}</p>
      </div>
    </Card>
  );
}
