import { useEffect, useState } from "react";
import api from "../../services/api";
import { getPartyLogoSrc, getPartyShortLabel } from "../../shared/utils/partyDisplay";
import "../styles/stats.css";

const TimelineIcon = ({ label }) => {
  if (label.includes("Start")) return <i className="ri-play-circle-line" />;
  if (label.includes("Progress")) return <i className="ri-time-line" />;
  if (label.includes("End")) return <i className="ri-flag-line" />;
  return <i className="ri-trophy-line" />;
};

export default function PartyStats() {
  const [current, setCurrent] = useState({
    electionName: "Current Election",
    partyName: "",
    votes: 0,
    position: 0,
    share: 0,
    lead: 0,
    status: "PENDING",
    short: "PRT",
    logoSrc: "",
    color: "#dc2626",
  });
  const [rankings, setRankings] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const statsRes = await api.get("/parties/current-stats");

        const statsData = statsRes.data?.data || {};
        const ownStats = statsData.stats || {};
        const totalVotes = Number(statsData.totalVotes || 0);

        const allParties = Array.isArray(statsData.allParties) ? statsData.allParties : [];
        const rankingData = allParties
          .map((item, index) => {
            const votes = Number(item.votes || 0);
            const shareValue = totalVotes ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0;
            return {
              rank: Number(item.position || index + 1),
              name: item.name || "Party",
              short: getPartyShortLabel(
                {
                  name: item.name,
                  shortName: item.shortName,
                  short: item.short,
                  symbol: item.logo,
                },
                "PRT",
              ),
              logoSrc: getPartyLogoSrc({ logo: item.logo, symbol: item.symbol }),
              votes,
              share: `${shareValue}%`,
              shareWidth: `${shareValue}%`,
              color: item.color || "#7c7cff",
              isOwn: Boolean(item.isOwn),
              highlight: Boolean(item.isOwn),
            };
          })
          .sort((a, b) => a.rank - b.rank);

        const ownParty =
          rankingData.find((item) => item.isOwn) ||
          rankingData.find((item) => item.rank === Number(ownStats.ownPosition || 0)) ||
          {
            name: "Your Party",
            short: "PRT",
            logoSrc: "",
            color: "#dc2626",
          };

        setCurrent({
          electionName: statsData.currentElection?.title || "Current Election",
          partyName: ownParty?.name || "Your Party",
          votes: Number(ownStats.ownVotes || 0),
          position: Number(ownStats.ownPosition || 0),
          share: Number(ownStats.voteShare || 0),
          lead: Number(ownStats.leadOverSecond || 0),
          status: statsData.currentElection?.status || "PENDING",
          short: ownParty?.short || "PRT",
          logoSrc: ownParty?.logoSrc || "",
          color: ownParty?.color || "#dc2626",
        });

        setRankings(rankingData);
        setLastUpdated(new Date().toLocaleString());

        setTimeline(
          [
            { label: "Voting Started", value: statsData.currentElection?.startDate },
            { label: "In Progress", value: "Live" },
            { label: "Voting Ends", value: statsData.currentElection?.endDate },
            {
              label: "Results Announcement",
              value:
                String(statsData.currentElection?.status || "").toLowerCase() === "ended"
                  ? "Published"
                  : statsData.currentElection?.endDate,
            },
          ].filter(Boolean),
        );
      } catch (err) {
        console.error("Failed to load party stats", err.message);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
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
              <div
                className="stats-hero-logo"
                style={current.logoSrc ? { background: "#fff" } : { background: current.color }}
              >
                {current.logoSrc ? (
                  <img src={current.logoSrc} alt={current.partyName} />
                ) : (
                  current.short
                )}
              </div>
              <div>
                <strong>{current.partyName}</strong>
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
            <strong>{current.position || "-"}</strong>
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
          {rankings.length === 0 ? (
            <div className="stats-empty">No live ranking data available yet.</div>
          ) : (
            rankings.map((item) => (
              <div
                key={`${item.rank}-${item.name}`}
                className={`stats-rank-item ${item.highlight ? "highlight" : ""}`}
              >
                <div className="stats-rank-left">
                  <div className={`stats-rank-number rank-${item.rank}`}>
                    {item.rank}
                  </div>
                  <div
                    className="stats-rank-logo"
                    style={item.logoSrc ? { background: "#fff" } : { background: item.color }}
                  >
                    {item.logoSrc ? (
                      <img src={item.logoSrc} alt={item.name} />
                    ) : (
                      item.short
                    )}
                  </div>
                  <div>
                    <div className="stats-rank-name">
                      {item.name}
                      {item.isOwn ? <span>Your Party</span> : item.rank === 1 ? <span>Leading</span> : null}
                    </div>
                    <div className="stats-rank-sub">Vote share</div>
                  </div>
                </div>
                <div className="stats-rank-right">
                  <strong>{item.votes}</strong>
                  <span>{item.share} share</span>
                </div>
                <div className="stats-rank-bar">
                  <span style={{ width: item.shareWidth, background: item.color }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <h3>Vote Comparison</h3>
          <div className="stats-compare">
            <div className="stats-compare-item highlight">
              <span className="stats-compare-label">Lead over 2nd place</span>
              <strong>
                {current.position === 1 ? `+${current.lead.toLocaleString()} votes` : "0 votes"}
              </strong>
            </div>
            <div className="stats-compare-item">
              <span className="stats-compare-label">Total votes cast</span>
              <strong>{rankings.reduce((sum, item) => sum + Number(item.votes || 0), 0).toLocaleString()}</strong>
            </div>
            <div className="stats-compare-item">
              <span className="stats-compare-label">Competing parties</span>
              <strong>{rankings.length}</strong>
            </div>
            <div className="stats-compare-item">
              <span className="stats-compare-label">Votes needed for majority</span>
              <strong>
                {Math.max(
                  Math.floor(rankings.reduce((sum, item) => sum + Number(item.votes || 0), 0) / 2) + 1 -
                    Number(current.votes || 0),
                  0,
                ).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
        <div className="stats-card">
          <h3>Election Timeline</h3>
          <div className="stats-timeline">
            {(timeline.length ? timeline : [{ label: "Timeline unavailable", value: "-" }]).map((item) => {
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
              Vote counts are updated live from backend database and admin-controlled metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
