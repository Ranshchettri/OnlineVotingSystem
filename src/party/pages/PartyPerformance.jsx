import { partyPerformance } from "../data/fakePartyData";
import "../styles/performance.css";

const StatIcon = ({ type }) => {
  const icon =
    type === "trophy"
      ? "ri-trophy-line"
      : type === "votes"
      ? "ri-bar-chart-box-line"
      : "ri-line-chart-line";
  return <i className={icon} aria-hidden="true" />;
};

export default function PartyPerformance() {
  const statTones = [
    { bg: "#dcfce7", color: "#16a34a" },
    { bg: "#dbeafe", color: "#2563eb" },
    { bg: "#ffedd5", color: "#ea580c" },
  ];
  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>{partyPerformance.title}</h1>
          <p>{partyPerformance.subtitle}</p>
        </div>
      </div>

      <div className="performance-stats">
        {partyPerformance.stats.map((stat, index) => (
          <div key={stat.label} className="performance-stat">
            <div
              className="performance-stat-icon"
              style={{
                background: statTones[index]?.bg || "#f1f5f9",
                color: statTones[index]?.color || "#475569",
              }}
            >
              <StatIcon type={stat.icon} />
            </div>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="performance-history party-card">
        <div className="performance-history-header">
          <h3>Election History</h3>
        </div>
        <div className="performance-history-list">
          {partyPerformance.history.map((item) => (
            <div key={item.id} className="performance-history-item">
              <div className="performance-history-head">
                <div>
                  <h4>{item.title}</h4>
                  <span>Year: {item.year}</span>
                </div>
                <span
                  className={`performance-badge ${
                    item.badge === "Winner" ? "success" : "neutral"
                  }`}
                >
                  {item.badge === "Winner" ? (
                    <i className="ri-trophy-line" aria-hidden="true" />
                  ) : null}
                  {item.badge}
                </span>
              </div>
              <div className="performance-history-boxes">
                <div className="performance-box">
                  <span>Votes Received</span>
                  <strong>{item.votes}</strong>
                </div>
                <div className="performance-box">
                  <span>Position</span>
                  <strong>{item.position}</strong>
                </div>
                <div className="performance-box">
                  <span>Result</span>
                  <strong className={item.result === "Won" ? "good" : "bad"}>
                    {item.result}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="performance-insights">
        <div className="performance-insights-title">
          <span>i</span>
          Performance Insights
        </div>
        <ul>
          {partyPerformance.insights.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
