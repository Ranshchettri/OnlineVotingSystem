import { partyStats } from "../data/fakePartyData";
import "../styles/stats.css";

export default function PartyStats() {
  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>{partyStats.title}</h1>
          <p>{partyStats.subtitle}</p>
        </div>
        <span className="party-pill green">Live Data</span>
      </div>

      <div className="stats-hero">
        <div className="stats-hero-header">
          <span className="stats-live-dot" />
          <div>
            <span className="stats-hero-label">Your Party - Live Data</span>
            <strong>{partyStats.yourParty.name}</strong>
            <span>National Election 2025</span>
          </div>
        </div>
        <div className="stats-hero-grid">
          <div>
            <span>Your Votes</span>
            <strong>{partyStats.yourParty.votes}</strong>
          </div>
          <div>
            <span>Current Position</span>
            <strong>{partyStats.yourParty.position}</strong>
          </div>
          <div>
            <span>Vote Share</span>
            <strong>{partyStats.yourParty.share}</strong>
          </div>
          <div>
            <span>Lead</span>
            <strong>{partyStats.yourParty.lead}</strong>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-section-head">
          <div>
            <h3>Live Vote Rankings</h3>
            <p>All parties performance (Read only)</p>
          </div>
          <span>{partyStats.lastUpdated}</span>
        </div>
        <div className="stats-rank-list">
          {partyStats.rankings.map((item) => (
            <div
              key={item.rank}
              className={`stats-rank-item ${item.highlight ? "highlight" : ""}`}
            >
              <div className="stats-rank-left">
                <div className="stats-rank-number">{item.rank}</div>
                <div
                  className="stats-rank-logo"
                  style={{ background: item.color }}
                >
                  {item.short}
                </div>
                <div>
                  <div className="stats-rank-name">
                    {item.name}
                    {item.tag ? <span>{item.tag}</span> : null}
                  </div>
                  <div className="stats-rank-sub">Development: 78%</div>
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
            {partyStats.comparison.map((item) => (
              <div key={item.label} className="stats-compare-item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="stats-card">
          <h3>Election Timeline</h3>
          <div className="stats-timeline">
            {partyStats.timeline.map((item) => (
              <div key={item.label} className="stats-timeline-item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-info">
        <strong>Real-Time Data</strong>
        <p>
          Vote counts are updated in real time as voters cast their ballots. All
          party data is read only and provided for transparency.
        </p>
      </div>
    </div>
  );
}
