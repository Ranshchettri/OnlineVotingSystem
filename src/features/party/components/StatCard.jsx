import Card from "../../../shared/ui/Card";

export default function StatCard({ title, value, icon = "📊" }) {
  return (
    <Card className="stat-card">
      <div className="stat-content">
        <span className="stat-icon">{icon}</span>
        <div>
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
        </div>
      </div>
    </Card>
  );
}
