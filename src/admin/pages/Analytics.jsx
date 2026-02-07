import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../styles/analytics.css";

const fallbackCandidates = [
  {
    id: "c1",
    name: "K.P. Sharma Oli",
    party: "Nepal Communist Party (UML)",
    votes: "1,247,893",
    development: 72,
    good: 85,
    bad: 15,
    goodTopics: ["Infrastructure development", "Education reforms", "Healthcare improvements"],
    badTopics: ["Corruption allegations", "Delayed projects", "Policy failures"],
  },
  {
    id: "c2",
    name: "Sher Bahadur Deuba",
    party: "Nepali Congress",
    votes: "1,089,234",
    development: 68,
    good: 78,
    bad: 22,
    goodTopics: ["Rural connectivity", "Agriculture subsidy", "Social security"],
    badTopics: ["Budget delays", "Policy reversals", "Inflation concerns"],
  },
  {
    id: "c3",
    name: "Rabi Lamichhane",
    party: "Rastriya Swatantra Party",
    votes: "610,156",
    development: 45,
    good: 62,
    bad: 38,
    goodTopics: ["Digital governance", "Youth programs", "Citizen services"],
    badTopics: ["Execution gaps", "Funding shortage", "Regional disputes"],
  },
];

export default function Analytics() {
  const [candidates, setCandidates] = useState(fallbackCandidates);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/candidates");
        const list = res.data?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setCandidates(
            list.map((c) => ({
              id: c._id || c.id,
              name: c.fullName || c.name,
              party: c.partyName || c.party || "Party",
              votes: c.totalVotes?.toLocaleString?.() || c.totalVotes || "0",
              development: c.development || c.totalTaskCompletion || 70,
              good: c.goodWork || 80,
              bad: c.badWork || 20,
              goodTopics: c.goodTopics || ["Infrastructure development", "Education reforms"],
              badTopics: c.badTopics || ["Policy delays", "Budget gaps"],
            })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = useMemo(() => {
    const total = candidates.length || 0;
    const avgDev =
      candidates.reduce((sum, c) => sum + (c.development || 0), 0) /
      (total || 1);
    const avgGood =
      candidates.reduce((sum, c) => sum + (c.good || 0), 0) / (total || 1);
    const avgBad =
      candidates.reduce((sum, c) => sum + (c.bad || 0), 0) / (total || 1);
    return {
      total,
      avgDev: avgDev.toFixed(1),
      avgGood: avgGood.toFixed(1),
      avgBad: avgBad.toFixed(1),
    };
  }, [candidates]);

  return (
    <div className="admin-page analytics-page">
      <div className="analytics-header">
        <div>
          <div className="admin-section-title">Analytics Dashboard</div>
          <div className="admin-section-subtitle">
            Candidate performance and development metrics
          </div>
        </div>
      </div>

      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <div className="stat-top">
            <div className="stat-label">Total Candidates</div>
            <span className="stat-icon teal" aria-hidden="true">
              <i className="ri-user-line" />
            </span>
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-top">
            <div className="stat-label">Avg Development</div>
            <span className="stat-icon green" aria-hidden="true">
              <i className="ri-bar-chart-box-line" />
            </span>
          </div>
          <div className="stat-value">{stats.avgDev}%</div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-top">
            <div className="stat-label">Avg Good Work</div>
            <span className="stat-icon teal" aria-hidden="true">
              <i className="ri-thumb-up-line" />
            </span>
          </div>
          <div className="stat-value">{stats.avgGood}%</div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-top">
            <div className="stat-label">Avg Bad Work</div>
            <span className="stat-icon red" aria-hidden="true">
              <i className="ri-thumb-down-line" />
            </span>
          </div>
          <div className="stat-value">{stats.avgBad}%</div>
        </div>
      </div>

      <div className="analytics-list">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="analytics-card">
            <div className="analytics-card__left">
              <div className="candidate-avatar">{candidate.name?.[0] || "C"}</div>
              <div>
                <div className="candidate-name">{candidate.name}</div>
                <div className="candidate-party">{candidate.party}</div>
                <div className="candidate-votes">{candidate.votes} votes</div>
              </div>
            </div>

            <div className="analytics-card__middle">
              <div className="metric-group">
                <div className="metric-title">Good Work Performance</div>
                <div className="metric-bar good">
                  <span style={{ width: `${candidate.good}%` }} />
                </div>
                <ul>
                  {candidate.goodTopics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div className="metric-group">
                <div className="metric-title">Bad Work Performance</div>
                <div className="metric-bar bad">
                  <span style={{ width: `${candidate.bad}%` }} />
                </div>
                <ul className="bad">
                  {candidate.badTopics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div className="analytics-actions">
                <button className="admin-button ghost">
                  <i className="ri-file-chart-line" aria-hidden="true" />
                  View Full Report
                </button>
                <button className="admin-button ghost">
                  <i className="ri-history-line" aria-hidden="true" />
                  Historical Data
                </button>
                <button className="admin-button primary">
                  <i className="ri-edit-line" aria-hidden="true" />
                  Update Analytics
                </button>
              </div>
            </div>

            <div className="analytics-card__right">
              <div className="circular-progress" style={{ "--value": candidate.development }}>
                <div className="progress-value">{candidate.development}%</div>
                <div className="progress-label">Development</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
