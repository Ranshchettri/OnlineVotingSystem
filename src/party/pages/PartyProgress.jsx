import { partyProgress } from "../data/fakePartyData";
import "../styles/progress.css";

const Ring = ({ value, label, color }) => (
  <div className="progress-ring" style={{ "--percent": value, "--ring-color": color }}>
    <div className="progress-ring-inner">
      <div className="progress-ring-value">{value}%</div>
      <div className="progress-ring-label">{label}</div>
    </div>
  </div>
);

export default function PartyProgress() {
  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>{partyProgress.title}</h1>
          <p>{partyProgress.subtitle}</p>
        </div>
      </div>

      <div className="progress-warning">
        <strong>Read-Only Section</strong>
        <p>
          These analytics are controlled by the Election Commission Admin. Parties
          cannot edit development percentages, damage reports, or work analytics.
        </p>
      </div>

      <div className="progress-grid">
        <div className="progress-card">
          <h3>Development Progress</h3>
          <Ring value={partyProgress.development} label="Development" color="#16a34a" />
          <div className="progress-bars">
            {partyProgress.developmentAreas.map((area) => (
              <div key={area.label} className="progress-bar-row success">
                <span>{area.label}</span>
                <strong>{area.value}%</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="progress-card">
          <h3>Damage Report</h3>
          <Ring value={partyProgress.damage} label="Damage" color="#dc2626" />
          <div className="progress-bars">
            {partyProgress.damageAreas.map((area) => (
              <div key={area.label} className="progress-bar-row danger">
                <span>{area.label}</span>
                <strong>{area.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="progress-card full">
        <h3>Work Analysis</h3>
        <div className="work-analysis">
          <div>
            <Ring value={partyProgress.workAnalysis.good} label="Good Work" color="#16a34a" />
            <p>Positive Impact</p>
          </div>
          <div>
            <Ring value={partyProgress.workAnalysis.bad} label="Bad Work" color="#dc2626" />
            <p>Negative Impact</p>
          </div>
        </div>
        <div className="progress-note">
          These metrics are evaluated by the Election Commission based on public feedback,
          policy implementation, and governance quality.
        </div>
      </div>
    </div>
  );
}
