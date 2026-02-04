import { partyHome } from "../data/fakePartyData";
import "../styles/home.css";

export default function PartyHome() {
  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>{partyHome.title}</h1>
          <p>{partyHome.subtitle}</p>
        </div>
        <button className="party-edit-btn" type="button">
          Edit Profile
        </button>
      </div>

      <div className="party-profile-card">
        <div className="party-profile-hero">
          <div
            className="party-profile-logo"
            style={{ background: partyHome.logoBg }}
          >
            <span>{partyHome.logoText}</span>
          </div>
          <div className="party-profile-info">
            <h2>{partyHome.name}</h2>
            <p>Leader: {partyHome.leader}</p>
            <span className="party-profile-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6l-8 8-4-4" />
              </svg>
              Verified Party
            </span>
          </div>
        </div>
        <div className="party-profile-body">
          <h3>Vision &amp; Motivation</h3>
          <p>{partyHome.vision}</p>
        </div>
      </div>

      <div className="party-team party-card">
        <h3>Team Members</h3>
        <div className="party-team-grid">
          {partyHome.team.map((member) => (
            <div key={member.name} className="party-team-card">
              <div
                className="party-team-photo"
                style={{ background: member.tone }}
              >
                <span>{member.initials}</span>
              </div>
              <div className="party-team-name">{member.name}</div>
              <div className="party-team-role">{member.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
