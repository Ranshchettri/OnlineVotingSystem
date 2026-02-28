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
        const [profileRes, progressRes, currentStatsRes, plansRes] = await Promise.all([
          api.get(`/parties/${partyId}`),
          api.get(`/parties/${partyId}/progress`).catch(() => ({ data: { data: {} } })),
          api.get(`/parties/${partyId}/current-stats`).catch(() => ({ data: { data: {} } })),
          api.get(`/parties/${partyId}/future-plans`).catch(() => ({ data: { data: {} } })),
        ]);
        const profileData = profileRes.data?.data?.party || null;
        const progress = progressRes.data?.data || {};
        const currentStats = currentStatsRes.data?.data || {};
        const plans = Array.isArray(plansRes.data?.data?.futurePlans)
          ? plansRes.data.data.futurePlans
          : Array.isArray(profileData?.futurePlans)
            ? profileData.futurePlans
            : [];
        const ownVotes = Number(currentStats?.stats?.ownVotes || 0);
        setParty(
          profileData
            ? {
                ...profileData,
                ...progress,
                totalVotes: ownVotes,
                futurePlans: plans,
                liveStats: currentStats.stats || {},
              }
            : null,
        );
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
  const short = getPartyShortLabel(party, "PRT");
  const logoSrc = getPartyLogoSrc(party);
  const team = Array.isArray(party.teamMembers) ? party.teamMembers : [];
  const plans = Array.isArray(party.futurePlans) ? party.futurePlans : [];
  const gallery = Array.isArray(party.gallery) ? party.gallery : [];
  const contact = party.contact || {};
  const socialMedia = party.socialMedia || {};
  const detailedMetrics = party.detailedMetrics || {};
  const workTotal = goodWork + badWork;
  const goodSlice = workTotal > 0 ? Number(((goodWork / workTotal) * 100).toFixed(1)) : 50;
  const badSlice = Number((100 - goodSlice).toFixed(1));

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
        <div className="party-hero-header" style={{ background: "#dc2626" }}>
          <div className="party-hero-logo">
            {logoSrc ? <img src={logoSrc} alt={party.name} /> : short}
          </div>
          <div className="party-hero-info">
            <h1 className="party-hero-title">{party.name}</h1>
            <p>Leader: {party.leader || "N/A"}</p>
            <div className="party-hero-stats-grid">
              <div className="party-hero-stat">
                <span>Established</span>
                <strong>
                  {party.establishedDate
                    ? new Date(party.establishedDate).toLocaleDateString()
                    : "-"}
                </strong>
              </div>
              <div className="party-hero-stat">
                <span>Headquarters</span>
                <strong>{party.headquarters || "-"}</strong>
              </div>
              <div className="party-hero-stat">
                <span>Total Members</span>
                <strong>{Number(party.totalMembers || 0).toLocaleString()}</strong>
              </div>
              <div className="party-hero-stat">
                <span>Election Wins</span>
                <strong>{Number(party.electionWins || 0)} Times</strong>
              </div>
            </div>
            <div className="party-hero-tags">
              <span className="party-tag">Votes: {Number(party.totalVotes || 0).toLocaleString()}</span>
              <span className="party-tag">Status: {String(party.status || "approved").toUpperCase()}</span>
              <span className="party-tag">Verified Party</span>
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
          <div
            className="work-chart"
            style={{
              "--good-slice": `${goodSlice}%`,
              "--bad-slice": `${badSlice}%`,
            }}
          >
            <div className="work-chart-inner">
              <strong>{goodWork}%</strong>
              <span>Good Work</span>
            </div>
          </div>
          <div className="work-grid">
            <div className="metric-badge good">Good Work: {goodWork}%</div>
            <div className="metric-badge bad">Bad Work: {badWork}%</div>
          </div>
          <div className="party-breakdown-grid">
            <div className="party-breakdown good">
              <strong>Good Work Breakdown</strong>
              <p>Infrastructure: {clampPercent(detailedMetrics.infrastructure)}%</p>
              <p>Healthcare: {clampPercent(detailedMetrics.healthcare)}%</p>
              <p>Education: {clampPercent(detailedMetrics.education)}%</p>
            </div>
            <div className="party-breakdown bad">
              <strong>Bad Work Breakdown</strong>
              <p>Policy failures: {clampPercent(detailedMetrics.policyFailures)}%</p>
              <p>Corruption cases: {clampPercent(detailedMetrics.corruptionCases)}%</p>
              <p>Public complaints: {clampPercent(detailedMetrics.publicComplaints)}%</p>
            </div>
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
        <h3>Team Members</h3>
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

      {gallery.length > 0 ? (
        <div className="party-section metric-card">
          <h3>Photo Gallery</h3>
          <div className="party-gallery-grid">
            {gallery.map((image, index) => (
              <div key={`gallery-${index}`} className="party-gallery-item">
                <img src={image} alt={`Gallery ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="party-section metric-card">
        <h3>Contact Information</h3>
        <div className="party-contact-grid">
          <div>
            <span>Office Address</span>
            <strong>{contact.address || party.headquarters || "-"}</strong>
          </div>
          <div>
            <span>Phone Number</span>
            <strong>{contact.phone || "-"}</strong>
          </div>
          <div>
            <span>Email Address</span>
            <strong>{contact.email || party.email || "-"}</strong>
          </div>
        </div>
      </div>

      <div className="party-section metric-card">
        <h3>Follow Us on Social Media</h3>
        <div className="party-social-row">
          <span>{socialMedia.facebook || "-"}</span>
          <span>{socialMedia.twitter || "-"}</span>
          <span>{socialMedia.website || "-"}</span>
        </div>
      </div>

      <div className="ready-banner">
        <h3>Ready to Vote?</h3>
        <p>Go back to the voting dashboard to cast your vote</p>
        <button type="button" className="ready-btn" onClick={() => navigate("/voter/dashboard")}>
          Go to Voting Dashboard
        </button>
      </div>
    </div>
  );
}
