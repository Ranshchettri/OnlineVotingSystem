import { Link, useParams } from "react-router-dom";
import { partyProfiles } from "../data/fakeVoterData";
import "../styles/party-profile.css";

const Ring = ({ value, label, sublabel, color }) => (
  <div className="ring" style={{ "--percent": value, "--ring-color": color }}>
    <div className="ring-inner">
      <div className="ring-value">{value}%</div>
      <div className="ring-label">{label}</div>
      {sublabel ? <div className="ring-sub">{sublabel}</div> : null}
    </div>
  </div>
);

export default function PartyProfile() {
  const { partyId } = useParams();
  const party = partyProfiles[partyId] || partyProfiles.rsp;

  return (
    <div className="party-profile">
      <div className="party-topbar">
        <Link to="/voter/dashboard" className="party-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Voting
        </Link>
        <div className="party-top-logo">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l8 3v6c0 5-3.2 9.4-8 11-4.8-1.6-8-6-8-11V5l8-3z"
              fill="#1E4F93"
            />
            <path
              d="M12 4l6 2.2V11c0 4-2.4 7.4-6 8.8-3.6-1.4-6-4.8-6-8.8V6.2L12 4z"
              fill="#E24C3B"
            />
            <path
              d="M12 6l4 1.5V11c0 3.1-1.8 5.8-4 6.8-2.2-1-4-3.7-4-6.8V7.5L12 6z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </div>

      <div className="party-hero">
        <div className="party-hero-header" style={{ background: party.bannerColor }}>
          <div
            className="party-hero-logo"
            style={{ background: party.logoColor }}
          >
            <span>{party.short}</span>
          </div>
          <div className="party-hero-info">
            <div className="party-hero-title">
              <span className="party-bell">🔔</span>
              {party.name}
            </div>
            <p>Leader: {party.leader}</p>
            <div className="party-hero-tags">
              <span className="party-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6l-8 8-4-4" />
                </svg>
                Verified Party
              </span>
              <span className="party-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" />
                  <path d="M4 6l8 6 8-6" />
                </svg>
                {party.email}
              </span>
            </div>
          </div>
        </div>

        <div className="party-hero-body">
          <h3>Vision &amp; Motivation</h3>
          <p>{party.vision}</p>
        </div>
      </div>

      <div className="party-metrics">
        <div className="metric-card">
          <h4>Development Score</h4>
          <p className="metric-note">
            Admin-controlled metric based on policy implementation
          </p>
          <Ring value={party.developmentScore} label="Development" color="#16a34a" />
          <div className="metric-badge">✓ High Development Score</div>
        </div>

        <div className="metric-card">
          <h4>Work Analysis</h4>
          <p className="metric-note">Good work vs Bad work evaluation</p>
          <div className="work-grid">
            <div>
              <Ring
                value={party.workAnalysis.good}
                label="Good Work"
                sublabel="Positive Impact"
                color="#16a34a"
              />
            </div>
            <div>
              <Ring
                value={party.workAnalysis.bad}
                label="Bad Work"
                sublabel="Negative Impact"
                color="#dc2626"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="party-section card">
        <h3>Future Plans</h3>
        <div className="plan-list">
          {party.futurePlans.map((plan, index) => (
            <div key={plan} className="plan-item">
              <span>{index + 1}</span>
              {plan}
            </div>
          ))}
        </div>
      </div>

      <div className="party-section card">
        <h3>Team Members</h3>
        <div className="team-grid">
          {party.teamMembers.map((member) => (
            <div key={member.name} className="team-card">
              <div className="team-photo">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} />
                ) : (
                  <span>{member.name[0]}</span>
                )}
              </div>
              <div className="team-name">{member.name}</div>
              <div className="team-role">{member.role}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ready-banner">
        <h3>Ready to Vote?</h3>
        <p>Go back to the voting dashboard to cast your vote</p>
        <Link className="ready-btn" to="/voter/dashboard">
          Go to Voting Dashboard
        </Link>
      </div>
    </div>
  );
}
