import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/progress.css";

const clampPercent = (value) => {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

export default function PartyProgress() {
  const [data, setData] = useState({
    development: 0,
    damage: 0,
    goodWork: 0,
    badWork: 0,
    detailedMetrics: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/parties/progress");
        const payload = res.data?.data || {};
        const development = clampPercent(payload.development);
        const damage =
          payload.damage !== undefined
            ? clampPercent(payload.damage)
            : clampPercent(100 - development);
        setData({
          development,
          damage,
          goodWork: clampPercent(payload.goodWork),
          badWork: clampPercent(payload.badWork),
          detailedMetrics: payload.detailedMetrics || {},
        });
      } catch (err) {
        console.error("Failed to load party progress", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="party-page">
        <p>Loading progress...</p>
      </div>
    );
  }

  const developmentAreas = [
    { label: "Infrastructure", key: "infrastructure" },
    { label: "Healthcare", key: "healthcare" },
    { label: "Education", key: "education" },
  ];

  const damageAreas = [
    { label: "Policy Failures", key: "policyFailures" },
    { label: "Corruption Cases", key: "corruptionCases" },
    { label: "Public Complaints", key: "publicComplaints" },
  ];

  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>Progress Analytics</h1>
          <p>Admin-controlled performance metrics</p>
        </div>
      </div>

      <div className="progress-warning">
        <strong>
          <i className="ri-lock-line" aria-hidden="true" /> Read-Only Section
        </strong>
        <p>
          These analytics are controlled by Election Commission Admin. Parties
          cannot edit development percentages, damage reports, or work analysis.
        </p>
      </div>

      <div className="progress-grid">
        <div className="progress-card">
          <h3>Development Progress</h3>
          <div
            className="progress-ring"
            style={{ "--percent": data.development, "--ring-color": "#16a34a" }}
          >
            <div className="progress-ring-inner">
              <div className="progress-ring-value">{data.development}%</div>
              <div className="progress-ring-label">Development</div>
            </div>
          </div>
          <div className="progress-bars">
            {developmentAreas.map((item) => (
              <div key={item.key} className="progress-bar-row success">
                <span>{item.label}</span>
                <strong>{clampPercent(data.detailedMetrics[item.key])}%</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="progress-card">
          <h3>Damage Report</h3>
          <div
            className="progress-ring"
            style={{ "--percent": data.damage, "--ring-color": "#dc2626" }}
          >
            <div className="progress-ring-inner">
              <div className="progress-ring-value">{data.damage}%</div>
              <div className="progress-ring-label">Damage</div>
            </div>
          </div>
          <div className="progress-bars">
            {damageAreas.map((item) => (
              <div key={item.key} className="progress-bar-row danger">
                <span>{item.label}</span>
                <strong>{clampPercent(data.detailedMetrics[item.key])}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="progress-card">
        <h3>Work Analysis</h3>
        <div className="work-analysis">
          <div>
            <div
              className="progress-ring"
              style={{ "--percent": data.goodWork, "--ring-color": "#16a34a", "--size": "95px", "--thickness": "8px" }}
            >
              <div className="progress-ring-inner">
                <div className="progress-ring-value">{data.goodWork}%</div>
              </div>
            </div>
            <p>
              <strong>Good Work</strong>
              <br />
              Positive impact
            </p>
          </div>

          <div>
            <div
              className="progress-ring"
              style={{ "--percent": data.badWork, "--ring-color": "#dc2626", "--size": "95px", "--thickness": "8px" }}
            >
              <div className="progress-ring-inner">
                <div className="progress-ring-value">{data.badWork}%</div>
              </div>
            </div>
            <p>
              <strong>Bad Work</strong>
              <br />
              Negative impact
            </p>
          </div>
        </div>
        <div className="progress-note">
          These metrics are evaluated by Election Commission based on public
          feedback, policy implementation, and governance quality.
        </div>
      </div>
    </div>
  );
}
