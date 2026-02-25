import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/stats.css";

const TimelineIcon = ({ label }) => {
  if (label.includes("Start")) return <i className="ri-play-circle-line" />;
  if (label.includes("Progress")) return <i className="ri-time-line" />;
  if (label.includes("End")) return <i className="ri-flag-line" />;
  return <i className="ri-trophy-line" />;
};

export default function PartyStats() {
  const [current, setCurrent] = useState({
    name: "Current Election",
    votes: 0,
    position: 0,
    share: 0,
    lead: 0,
    status: "PENDING",
    startDate: null,
    endDate: null,
  });
  const [rankings, setRankings] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, partyRes] = await Promise.all([
          api.get("/party/current-stats"),
          api.get("/parties"),
        ]);

        const statsData = statsRes.data?.data || {};
        setCurrent({
          name: statsData.currentElection?.title || "Current Election",
          votes: statsData.stats?.ownVotes || 0,
          position: statsData.stats?.ownPosition || 0,
          share: statsData.stats?.voteShare || 0,
          lead: statsData.stats?.leadOverSecond || 0,
          status: statsData.currentElection?.status || "PENDING",
          startDate: statsData.currentElection?.startDate,
          endDate: statsData.currentElection?.endDate,
        });

        const partyList = partyRes.data?.data?.parties || partyRes.data?.data || partyRes.data || [];
        const totalVotes = partyList.reduce((acc, p) => acc + (p.totalVotes || 0), 0);
        const rankingData = partyList
          .sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0))
          .map((p, idx) => ({
            rank: idx + 1,
            name: p.name,
            short: p.shortName || p.symbol || p.name?.slice(0, 3),
            votes: p.totalVotes || 0,
            share: totalVotes ? `${(((p.totalVotes || 0) / totalVotes) * 100).toFixed(1)}%` : "0%",
            color: p.color || "#7c7cff",
            highlight: idx === 0,
          }));
        setRankings(rankingData);
        setLastUpdated(new Date().toLocaleString());

        setTimeline(
          [
            { label: "Voting Started", value: statsData.currentElection?.startDate },
            { label: "In Progress", value: "Live" },
            { label: "Voting Ends", value: statsData.currentElection?.endDate },
          ].filter(Boolean),
        );
      } catch (err) {
        console.error("Failed to load party stats", err.message);
      }
    };
    load();
  }, []);

  return (
    <div className="party-page party-page--stats">
      <div className="party-page-header">
        <div>
          <h1>Current Election Stats</h1>
          <p>Live performance overview for your party</p>
        </div>
        <span className="party-pill green">Live Data</span>
      </div>

      <div className="stats-hero">
        <div className="stats-hero-header">
          <span className="stats-live-dot" />
          <div>
            <span className="stats-hero-label">Your Party - Live Data</span>
            <div className="stats-hero-title">
              <div className="stats-hero-logo">
                {rankings[0]?.short || "PRT"}
              </div>
              <div>
                <strong>{current.name}</strong>
                <span>{current.status}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="stats-hero-grid">
          <div>
            <span>Your Votes</span>
            <strong>{current.votes}</strong>
          </div>
          <div>
            <span>Current Position</span>
            <strong>{current.position || "—"}</strong>
          </div>
          <div>
            <span>Vote Share</span>
            <strong>{current.share}%</strong>
          </div>
          <div>
            <span>Lead</span>
            <strong>{current.lead}</strong>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-section-head">
          <div>
            <h3>Live Vote Rankings</h3>
            <p>All parties performance (Read only)</p>
          </div>
          <span>{lastUpdated}</span>
        </div>
        <div className="stats-rank-list">
          {rankings.map((item) => (
            <div
              key={item.rank}
              className={`stats-rank-item ${item.highlight ? "highlight" : ""}`}
            >
              <div className="stats-rank-left">
                <div className={`stats-rank-number rank-${item.rank}`}>
                  {item.rank}
                </div>
                <div
                  className="stats-rank-logo"
                  style={{ background: item.color }}
                >
                  {item.short}
                </div>
                <div>
                  <div className="stats-rank-name">
                    {item.name}
                    {item.rank === 1 ? <span>Leading</span> : null}
                  </div>
                  <div className="stats-rank-sub">Vote share</div>
                </div>
              </div>
              <div className="stats-rank-right">
                <strong>{item.votes}</strong>
                <span>{item.share} share</span>
              </div>
              <div className="stats-rank-bar">
                <span style={{ width: item.share, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <h3>Vote Comparison</h3>
          <div className="stats-compare">
            <div className="stats-compare-item highlight">
              <span className="stats-compare-label">
                <span className="stats-compare-dot" />
                You
              </span>
              <strong>{current.votes}</strong>
            </div>
            {rankings.slice(1, 3).map((item) => (
              <div key={item.rank} className="stats-compare-item">
                <span className="stats-compare-label">
                  <span className="stats-compare-dot" />
                  {item.name}
                </span>
                <strong>{item.votes}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="stats-card">
          <h3>Election Timeline</h3>
          <div className="stats-timeline">
            {timeline.map((item) => {
              const status = item.label.includes("Start")
                ? "start"
                : item.label.includes("Progress")
                  ? "progress"
                  : item.label.includes("End")
                    ? "end"
                    : "result";
              return (
                <div key={item.label} className="stats-timeline-item">
                  <span className={`stats-timeline-icon ${status}`}>
                    <TimelineIcon label={item.label} />
                  </span>
                  <span>{item.label}</span>
                  <strong>
                    {item.value && item.value !== "Live"
                      ? new Date(item.value).toLocaleString()
                      : item.value || "Live"}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="stats-info">
        <div className="stats-info-head">
          <span>i</span>
          <div>
            <strong>Real-Time Data</strong>
            <p>
              Vote counts are updated live from the backend. To change numbers,
              cast votes or adjust party analytics via admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
