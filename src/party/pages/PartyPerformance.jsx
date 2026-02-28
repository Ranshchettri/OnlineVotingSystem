import { useEffect, useState } from "react";
import api from "../../services/api";
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

const formatCompactVotes = (value) => {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return "0";
  if (numeric >= 1000) return `${(numeric / 1000).toFixed(1)}K`;
  return String(numeric);
};

export default function PartyPerformance() {
  const [summary, setSummary] = useState({
    totalWins: 0,
    averageVotes: 0,
    winRate: "0%",
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/parties/past-performance");
        const payload = res.data?.data || {};
        setSummary(payload.summary || { totalWins: 0, averageVotes: 0, winRate: "0%" });
        setHistory(Array.isArray(payload.pastElections) ? payload.pastElections : []);
      } catch (err) {
        console.error("Failed to load performance data", err.message);
        setSummary({ totalWins: 0, averageVotes: 0, winRate: "0%" });
        setHistory([]);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Total Wins", value: Number(summary.totalWins || 0), icon: "trophy" },
    { label: "Average Votes", value: formatCompactVotes(summary.averageVotes), icon: "votes" },
    { label: "Win Rate", value: summary.winRate || "0%", icon: "trend" },
  ];

  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>Past Performance</h1>
          <p>Historical election results from backend database</p>
        </div>
      </div>

      <div className="performance-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="performance-stat">
            <div className="performance-stat-icon">
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
          {history.length === 0 ? (
            <div className="performance-history-item">
              <div className="performance-history-top">
                <h4>No past elections found.</h4>
              </div>
            </div>
          ) : (
            history.map((item, index) => {
              const won = Boolean(item.won || Number(item.position || 0) === 1);
              const positionLabel =
                Number(item.position || 0) > 0
                  ? item.totalParties
                    ? `${item.position} / ${item.totalParties}`
                    : `${item.position}`
                  : "-";

              return (
                <div
                  key={`${item.election || "Election"}-${item.year || index}`}
                  className="performance-history-item"
                >
                  <div className="performance-history-head">
                    <div>
                      <h4>{item.election || "Election"}</h4>
                      <span>Year: {item.year || "-"}</span>
                    </div>
                    <span className={`performance-badge ${won ? "success" : "neutral"}`}>
                      {won ? <i className="ri-trophy-line" aria-hidden="true" /> : null}
                      {won ? "Winner" : "Lost"}
                    </span>
                  </div>
                  <div className="performance-history-boxes">
                    <div className="performance-box">
                      <span>Votes Received</span>
                      <strong>{Number(item.votes || 0).toLocaleString()}</strong>
                    </div>
                    <div className="performance-box">
                      <span>Position</span>
                      <strong>{positionLabel}</strong>
                    </div>
                    <div className="performance-box">
                      <span>Result</span>
                      <strong className={won ? "good" : "bad"}>
                        {won ? "Won" : "Not Won"}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="performance-insights">
        <div className="performance-insights-title">
          <span>i</span>
          Performance Insights
        </div>
        <ul>
          <li>Metrics are automatically computed from stored election history.</li>
          <li>Ended election votes are reflected in this section.</li>
          <li>New election results will appear after backend data updates.</li>
        </ul>
      </div>
    </div>
  );
}
