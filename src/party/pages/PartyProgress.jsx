import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/progress.css";

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
        setData({
          development: payload.development ?? 0,
          damage: payload.damage ?? 0,
          goodWork: payload.goodWork ?? 0,
          badWork: payload.badWork ?? 0,
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

  const metrics = [
    { label: "Infrastructure", key: "infrastructure" },
    { label: "Healthcare", key: "healthcare" },
    { label: "Education", key: "education" },
    { label: "Economy", key: "economy" },
  ];

  return (
    <div className="party-page">
      <div className="party-page-header party-header-compact">
        <div>
          <h1>Party Progress</h1>
          <p>Live development and work quality pulled from backend.</p>
        </div>
        <span className="party-pill green">Live</span>
      </div>

      <div className="progress-grid party-card">
        <div className="progress-main">
          <div className="progress-bar">
            <span style={{ width: `${data.development}%` }} />
          </div>
          <div className="progress-labels">
            <div>
              <strong>{data.development}%</strong>
              <span>Development</span>
            </div>
            <div>
              <strong>{data.damage}%</strong>
              <span>Remaining</span>
            </div>
          </div>
        </div>
        <div className="progress-cards">
          <div className="progress-card success">
            <i className="ri-checkbox-circle-line" aria-hidden="true" />
            <div>
              <p>Good Work</p>
              <strong>{data.goodWork}%</strong>
            </div>
          </div>
          <div className="progress-card warn">
            <i className="ri-alert-line" aria-hidden="true" />
            <div>
              <p>Bad Work</p>
              <strong>{data.badWork}%</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-metrics party-card">
        <h3>Detailed Metrics</h3>
        <div className="progress-metric-list">
          {metrics.map((m) => (
            <div key={m.key} className="progress-metric">
              <div className="metric-head">
                <span>{m.label}</span>
                <strong>{data.detailedMetrics[m.key] ?? 0}%</strong>
              </div>
              <div className="metric-bar">
                <span style={{ width: `${data.detailedMetrics[m.key] || 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
