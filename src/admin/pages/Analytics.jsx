import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../styles/analytics.css";

const fallbackCandidates = [
  {
    id: "c1",
    name: "K.P. Sharma Oli",
    party: "Nepal Communist Party (UML)",
    votes: "1,247,893",
    avatar: "https://i.pravatar.cc/100?img=12",
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
    avatar: "https://i.pravatar.cc/100?img=47",
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
    avatar: "https://i.pravatar.cc/100?img=32",
    development: 45,
    good: 62,
    bad: 38,
    goodTopics: ["Digital governance", "Youth programs", "Citizen services"],
    badTopics: ["Execution gaps", "Funding shortage", "Regional disputes"],
  },
];

export default function Analytics() {
  const [candidates, setCandidates] = useState(fallbackCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [toast, setToast] = useState(null);
  const [updateValues, setUpdateValues] = useState({
    development: 70,
    good: 80,
    bad: 20,
  });

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
              avatar: c.avatar || c.photo || c.image,
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

  const historyRows = [
    { year: "2020", development: 65, good: 78, bad: 22, votes: "980,000 votes" },
    { year: "2021", development: 68, good: 80, bad: 20, votes: "1,050,000 votes" },
    { year: "2022", development: 70, good: 82, bad: 18, votes: "1,120,000 votes" },
    { year: "2023", development: 71, good: 84, bad: 16, votes: "1,180,000 votes" },
    { year: "2024", development: 72, good: 85, bad: 15, votes: "1,247,893 votes" },
  ];

  const openReport = (candidate) => {
    setSelectedCandidate(candidate);
    setShowReport(true);
  };

  const openHistory = (candidate) => {
    setSelectedCandidate(candidate);
    setShowHistory(true);
  };

  const openUpdate = (candidate) => {
    setSelectedCandidate(candidate);
    setUpdateValues({
      development: candidate.development,
      good: candidate.good,
      bad: candidate.bad,
    });
    setShowUpdate(true);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const saveUpdate = () => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidate.id
          ? {
              ...c,
              development: updateValues.development,
              good: updateValues.good,
              bad: updateValues.bad,
            }
          : c,
      ),
    );
    setShowUpdate(false);
    showToast("Analytics updated successfully");
  };

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
              {candidate.avatar ? (
                <img
                  className="candidate-avatar photo"
                  src={candidate.avatar}
                  alt={candidate.name}
                />
              ) : (
                <div className="candidate-avatar">{candidate.name?.[0] || "C"}</div>
              )}
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
                <ul className="good">
                  {candidate.goodTopics.map((topic) => (
                    <li key={topic}>
                      <i className="ri-checkbox-circle-line" aria-hidden="true" />
                      {topic}
                    </li>
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
                    <li key={topic}>
                      <i className="ri-close-circle-line" aria-hidden="true" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="analytics-actions">
                <button className="admin-button ghost" onClick={() => openReport(candidate)}>
                  <i className="ri-file-chart-line" aria-hidden="true" />
                  View Full Report
                </button>
                <button className="admin-button ghost" onClick={() => openHistory(candidate)}>
                  <i className="ri-history-line" aria-hidden="true" />
                  Historical Data
                </button>
                <button className="admin-button primary" onClick={() => openUpdate(candidate)}>
                  <i className="ri-edit-line" aria-hidden="true" />
                  Update Analytics
                </button>
              </div>
            </div>

            <div className="analytics-card__right">
              <div className="progress-wrap">
                <div className="circular-progress" style={{ "--value": candidate.development }}>
                  <div className="progress-value">{candidate.development}%</div>
                </div>
                <div className="progress-label">Development</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="admin-toast success">
          <i className="ri-checkbox-circle-line" aria-hidden="true" />
          {toast}
        </div>
      )}

      {showReport && selectedCandidate && (
        <div className="admin-modal-backdrop" onClick={() => setShowReport(false)}>
          <div className="admin-modal report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="candidate-head">
                {selectedCandidate.avatar ? (
                  <img
                    className="candidate-avatar photo"
                    src={selectedCandidate.avatar}
                    alt={selectedCandidate.name}
                  />
                ) : (
                  <div className="candidate-avatar">
                    {selectedCandidate.name?.[0] || "C"}
                  </div>
                )}
                <div>
                  <div className="candidate-name">{selectedCandidate.name}</div>
                  <div className="candidate-party">{selectedCandidate.party}</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowReport(false)}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
            <div className="report-grid">
              <div className="report-box good">
                <div className="report-title">
                  <i className="ri-thumb-up-line" aria-hidden="true" />
                  Good Work Breakdown
                </div>
                {selectedCandidate.goodTopics.map((topic) => (
                  <div key={topic} className="report-row">
                    <span>{topic}</span>
                    <span>{selectedCandidate.good}%</span>
                  </div>
                ))}
              </div>
              <div className="report-box bad">
                <div className="report-title">
                  <i className="ri-thumb-down-line" aria-hidden="true" />
                  Bad Work Breakdown
                </div>
                {selectedCandidate.badTopics.map((topic) => (
                  <div key={topic} className="report-row">
                    <span>{topic}</span>
                    <span>{selectedCandidate.bad}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="summary-grid">
              <div>
                <div className="stat-number">{selectedCandidate.development}%</div>
                <div className="stat-label">Development</div>
              </div>
              <div>
                <div className="stat-number">{selectedCandidate.good}%</div>
                <div className="stat-label">Good Work</div>
              </div>
              <div>
                <div className="stat-number">{selectedCandidate.bad}%</div>
                <div className="stat-label">Bad Work</div>
              </div>
              <div>
                <div className="stat-number">{selectedCandidate.votes}</div>
                <div className="stat-label">Total Votes</div>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-button ghost wide" onClick={() => setShowReport(false)}>
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && selectedCandidate && (
        <div className="admin-modal-backdrop" onClick={() => setShowHistory(false)}>
          <div className="admin-modal history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="history-title">
                <span className="modal-icon teal">
                  <i className="ri-history-line" aria-hidden="true" />
                </span>
                <div>
                  <div className="candidate-name">Historical Data</div>
                  <div className="candidate-party">{selectedCandidate.name}</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowHistory(false)}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
            <div className="history-list">
              {historyRows.map((row) => (
                <div key={row.year} className="history-row">
                  <div className="year-pill">{row.year}</div>
                  <div className="history-bars">
                    <div>
                      <div className="stat-label">Development</div>
                      <div className="metric-bar good">
                        <span style={{ width: `${row.development}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="stat-label">Good Work</div>
                      <div className="metric-bar good">
                        <span style={{ width: `${row.good}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="stat-label">Bad Work</div>
                      <div className="metric-bar bad">
                        <span style={{ width: `${row.bad}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="history-votes">{row.votes}</div>
                </div>
              ))}
            </div>
            <div className="trend-box">
              <i className="ri-line-chart-line" aria-hidden="true" />
              Development has improved by 7% since 2020.
            </div>
            <div className="admin-modal-actions">
              <button className="admin-button ghost wide" onClick={() => setShowHistory(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdate && selectedCandidate && (
        <div className="admin-modal-backdrop" onClick={() => setShowUpdate(false)}>
          <div className="admin-modal update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="history-title">
                <span className="modal-icon red">
                  <i className="ri-edit-line" aria-hidden="true" />
                </span>
                <div>
                  <div className="candidate-name">Update Analytics</div>
                  <div className="candidate-party">{selectedCandidate.name}</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowUpdate(false)}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
            <div className="slider-group">
              <div className="slider-label">Development Score: {updateValues.development}%</div>
              <input
                type="range"
                min="0"
                max="100"
                value={updateValues.development}
                onChange={(e) =>
                  setUpdateValues((p) => ({ ...p, development: Number(e.target.value) }))
                }
              />
            </div>
            <div className="slider-group">
              <div className="slider-label">Good Work: {updateValues.good}%</div>
              <input
                type="range"
                min="0"
                max="100"
                value={updateValues.good}
                onChange={(e) =>
                  setUpdateValues((p) => ({ ...p, good: Number(e.target.value) }))
                }
              />
            </div>
            <div className="slider-group">
              <div className="slider-label">Bad Work: {updateValues.bad}%</div>
              <input
                type="range"
                min="0"
                max="100"
                value={updateValues.bad}
                onChange={(e) =>
                  setUpdateValues((p) => ({ ...p, bad: Number(e.target.value) }))
                }
              />
            </div>
            <div className="info-callout">
              <i className="ri-alert-line" aria-hidden="true" />
              Changes will be visible to the candidate, their party, and all voters immediately.
            </div>
            <div className="admin-modal-actions">
              <button className="admin-button ghost wide" onClick={() => setShowUpdate(false)}>
                Cancel
              </button>
              <button className="admin-button primary wide" onClick={saveUpdate}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
