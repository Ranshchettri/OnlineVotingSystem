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
  const [current, setCurrent] = useState({
    votes: 0,
    position: 0,
    share: 0,
    lead: 0,
    election: "Current Election",
  });
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({ totalWins: 0, averageVotes: 0, winRate: "0%" });

  useEffect(() => {
    const load = async () => {
      try {
        const [currentRes, pastRes] = await Promise.all([
          api.get("/party/current-stats"),
          api.get("/party/past-performance"),
        ]);

        const currentData = currentRes.data?.data || {};
        setCurrent({
          votes: currentData.stats?.ownVotes || 0,
          position: currentData.stats?.ownPosition || 0,
          share: currentData.stats?.voteShare || 0,
          lead: currentData.stats?.leadOverSecond || 0,
          election: currentData.currentElection?.title || "Current Election",
        });

        const past = pastRes.data?.data || {};
        setHistory(past.pastElections || []);
        setSummary(past.summary || { totalWins: 0, averageVotes: 0, winRate: "0%" });
      } catch (err) {
        console.error("Failed to load performance data", err.message);
      }
    };
    load();
  }, []);

  const stats = [
    { label: "Total Votes", value: current.votes.toLocaleString(), icon: "votes" },
    { label: "Current Position", value: current.position || "—", icon: "trophy" },
    { label: "Vote Share", value: `${current.share}%`, icon: "trend" },
  ];

  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>Performance</h1>
          <p>{current.election}</p>
        </div>
      </div>

      <div className="performance-stats">
        {stats.map((stat, index) => (
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
          <div className="performance-summary">
            <span>Wins: {summary.totalWins}</span>
            <span>Avg Votes: {summary.averageVotes.toLocaleString?.() || summary.averageVotes}</span>
            <span>Win Rate: {summary.winRate}</span>
          </div>
        </div>
        <div className="performance-history-list">
          {history.length === 0 ? (
            <div className="performance-empty">No past elections found.</div>
          ) : (
            history.map((item) => (
              <div key={`${item.year}-${item.election}`} className="performance-history-item">
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
          <li>Live numbers are pulled from the current election stats endpoint.</li>
          <li>Past performance reflects saved historical data for this party.</li>
          <li>Update analytics in admin to keep these charts accurate.</li>
        </ul>
      </div>
    </div>
  );
}
