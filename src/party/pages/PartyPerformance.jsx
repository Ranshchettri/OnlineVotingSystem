import { partyPerformance } from "../data/fakePartyData";
import "../styles/performance.css";

const StatIcon = ({ type }) => {
  if (type === "trophy") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v4H7z" />
        <path d="M6 8h12l-1 5H7z" />
      </svg>
    );
  }
  if (type === "votes") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 20h16" />
        <rect x="6" y="10" width="4" height="6" />
        <rect x="14" y="6" width="4" height="10" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h6l2 3 4-7 4 9" />
    </svg>
  );
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 21h8" />
                      <path d="M12 17v4" />
                      <path d="M7 4h10v4H7z" />
                      <path d="M6 8h12l-1 5H7z" />
                    </svg>
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
