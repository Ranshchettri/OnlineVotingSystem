import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { getPartyLogoSrc, getPartyShortLabel } from "../../shared/utils/partyDisplay";
import "../styles/party-profile.css";

const clampPercent = (value) => {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
};

export default function PartyProfile() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParty = async () => {
      try {
        setLoading(true);
        const [profileRes, statsRes, plansRes] = await Promise.all([
          api.get(`/parties/${partyId}`),
          api.get(`/parties/${partyId}/stats`).catch(() => ({ data: { data: {} } })),
          api.get(`/parties/${partyId}/future-plans`).catch(() => ({ data: { data: {} } })),
        ]);
        const profileData = profileRes.data?.data?.party || null;
        const stats = statsRes.data?.data || {};
        const plans = Array.isArray(plansRes.data?.data?.futurePlans)
          ? plansRes.data.data.futurePlans
          : Array.isArray(profileData?.futurePlans)
            ? profileData.futurePlans
            : [];
        setParty(profileData ? { ...profileData, ...stats, futurePlans: plans } : null);
      } catch (error) {
        console.error("Failed to load party profile:", error?.response?.data || error.message);
        setParty(null);
      } finally {
        setLoading(false);
      }
    };
    loadParty();
  }, [partyId]);

  if (loading) return <p>Loading party profile...</p>;
  if (!party) return <p>Party not found.</p>;

  const development = clampPercent(party.development);
  const goodWork = clampPercent(party.goodWork);
  const badWork = clampPercent(party.badWork);
  const partyColor = party.color || "#2563eb";
  const short = getPartyShortLabel(party, "PRT");
  const logoSrc = getPartyLogoSrc(party);
  const team = Array.isArray(party.teamMembers) ? party.teamMembers : [];
  const plans = Array.isArray(party.futurePlans) ? party.futurePlans : [];

  return (
    <div className="party-profile">
      <div className="party-topbar">
        <button type="button" className="party-back" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      </div>

      <div className="party-hero">
        <div className="party-hero-header" style={{ background: partyColor }}>
          <div className="party-hero-logo">
            {logoSrc ? <img src={logoSrc} alt={party.name} /> : short}
          </div>
          <div className="party-hero-info">
            <h1 className="party-hero-title">{party.name}</h1>
            <p>Leader: {party.leader || "N/A"}</p>
            <div className="party-hero-tags">
              <span className="party-tag">Votes: {Number(party.totalVotes || 0).toLocaleString()}</span>
              <span className="party-tag">Status: {String(party.status || "approved").toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="party-hero-body">
          <h3>Vision</h3>
          <p>{party.vision || party.description || "No vision details available."}</p>
        </div>
      </div>

      <div className="party-metrics">
        <div className="metric-card">
          <h4>Development Score</h4>
          <p className="metric-note">Computed from latest backend metrics.</p>
          <div className="ring" style={{ "--percent": development, "--ring-color": "#16a34a" }}>
            <div className="ring-inner">
              <div className="ring-value">{development}%</div>
              <div className="ring-label">Development</div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h4>Work Analysis</h4>
          <p className="metric-note">Good and bad work percentages.</p>
          <div className="work-grid">
            <div className="metric-badge">Good Work: {goodWork}%</div>
            <div className="metric-badge">Bad Work: {badWork}%</div>
          </div>
        </div>
      </div>

      <div className="party-section metric-card">
        <h3>Future Plans</h3>
        <div className="plan-list">
          {plans.length === 0 ? (
            <div className="plan-item">
              <span>1</span>
              No future plans submitted.
            </div>
          ) : (
            plans.map((plan, index) => (
              <div key={`${plan}-${index}`} className="plan-item">
                <span>{index + 1}</span>
                {plan}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="party-section metric-card">
        <h3>Core Team</h3>
        <div className="team-grid">
          {team.length === 0 ? (
            <p>No team members listed.</p>
          ) : (
            team.map((member, index) => (
              <div key={`${member.name}-${index}`} className="team-card">
                <div className="team-photo">
                  {member.photo ? <img src={member.photo} alt={member.name} /> : <span>{member.name?.slice(0, 1) || "M"}</span>}
                </div>
                <p className="team-name">{member.name || "Member"}</p>
                <p className="team-role">{member.position || member.role || "Member"}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
