const icons = {
  green: <i className="ri-bar-chart-box-line" aria-hidden="true" />,
  yellow: <i className="ri-trophy-line" aria-hidden="true" />,
  orange: <i className="ri-team-line" aria-hidden="true" />,
  red: <i className="ri-user-voice-line" aria-hidden="true" />,
};

export default function StatCard({ label, value, tone, size }) {
  return (
    <div className={`card stat-card stat-card--${tone}`}>
      <div className="stat-card-icon">{icons[tone]}</div>
      <div>
        <p className="stat-card-label">{label}</p>
        <p className={`stat-card-value ${size === "sm" ? "sm" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
