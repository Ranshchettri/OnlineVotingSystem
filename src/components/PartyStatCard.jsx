export default function PartyStatCard({ title, value, icon, color }) {
  return (
    <div className="party-stat-card" style={{ borderLeftColor: color }}>
      <div
        className="stat-icon"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}
