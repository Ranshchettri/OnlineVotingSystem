import Card from "../../../shared/ui/Card";

export default function TimelineItem({ item }) {
  const resultColor = item.result === "Won" ? "#22c55e" : "#ef4444";

  return (
    <Card className="timeline-item">
      <div className="timeline-content">
        <div className="timeline-date">{item.date}</div>
        <div className="timeline-body">
          <h4>{item.election}</h4>
          <p>
            You voted for <strong>{item.choice}</strong>
          </p>
          <p style={{ color: resultColor, fontWeight: 600 }}>
            {item.result === "Won" ? "✓" : "✗"} {item.result}
          </p>
        </div>
      </div>
    </Card>
  );
}
