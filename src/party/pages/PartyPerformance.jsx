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
        const data = res.data?.data || {};
        setSummary(data.summary || { totalWins: 0, averageVotes: 0, winRate: "0%" });
        setHistory(data.pastElections || []);
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
    { label: "Total Wins", value: summary.totalWins || 0, icon: "trophy" },
    {
      label: "Average Votes",
      value:
        summary.averageVotes > 1000
          ? `${(summary.averageVotes / 1000).toFixed(1)}K`
          : summary.averageVotes || 0,
      icon: "votes",
    },
    { label: "Win Rate", value: summary.winRate || "0%", icon: "trend" },
  ];

  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>Past Performance</h1>
          <p>Historical election results from the last 5 elections</p>
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
            history.map((item) => (
              <div key={`${item.year}-${item.election || item.title}`} className="performance-history-item">
                <div className="performance-history-head">
                  <div>
                    <h4>{item.election || item.title || "Election"}</h4>
                    <span>Year: {item.year || "—"}</span>
                  </div>
                  <span
                    className={`performance-badge ${
                      item.position === 1 || item.won ? "success" : "neutral"
                    }`}
                  >
                    {item.position === 1 || item.won ? (
                      <i className="ri-trophy-line" aria-hidden="true" />
                    ) : null}
                    {item.position === 1 || item.won ? "Winner" : "Participated"}
                  </span>
                </div>
                <div className="performance-history-boxes">
                  <div className="performance-box">
                    <span>Votes Received</span>
                    <strong>{item.votes || 0}</strong>
                  </div>
                  <div className="performance-box">
                    <span>Position</span>
                    <strong>{item.position || "—"}</strong>
                  </div>
                  <div className="performance-box">
                    <span>Result</span>
                    <strong className={item.position === 1 || item.won ? "good" : "bad"}>
                      {item.position === 1 || item.won ? "Won" : "—"}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="performance-insights">
        <div className="performance-insights-title">
          <span>i</span>
          Performance Insights
        </div>
        <ul>
          <li>Live metrics are mirrored from admin analytics.</li>
          <li>Update party analytics in admin to change these numbers.</li>
          <li>History shows last 5 elections; newer results will appear automatically.</li>
        </ul>
      </div>
    </div>
  );
}
