import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { getPartyLogoSrc } from "../../shared/utils/partyDisplay";
import "../styles/analytics.css";

const METRIC_LABELS = {
  infrastructure: "Infrastructure",
  healthcare: "Healthcare",
  education: "Education",
  policyFailures: "Policy failures",
  corruptionCases: "Corruption cases",
  publicComplaints: "Public complaints",
};

const clampPercent = (value) => {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const toHistoryRows = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => ({
      year: Number(item?.year || 0) || "",
      label: item?.label || "",
      votes: Number(item?.votes || 0),
      development: clampPercent(item?.development),
      goodWork: clampPercent(item?.goodWork ?? item?.good),
      badWork: clampPercent(item?.badWork ?? item?.bad),
    }))
    .filter((item) => item.year || item.label)
    .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

const buildTopicRows = (detailedMetrics = {}, mode = "good") => {
  const keys =
    mode === "good"
      ? ["infrastructure", "healthcare", "education"]
      : ["policyFailures", "corruptionCases", "publicComplaints"];
  return keys.map((key) => ({
    key,
    label: METRIC_LABELS[key],
    value: clampPercent(detailedMetrics?.[key]),
  }));
};

const sanitizeTopicRows = (rows = []) =>
  (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      label: String(row?.label || "").trim(),
      value: clampPercent(row?.value),
    }))
    .filter((row) => Boolean(row.label));

export default function Analytics() {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [toast, setToast] = useState(null);
  const [updateValues, setUpdateValues] = useState({
    development: 0,
    good: 0,
    bad: 0,
    goodTopics: [],
    badTopics: [],
  });

  const mapAnalyticsRow = (row = {}) => {
    const detailed = row.detailedMetrics || {};
    const goodWorkBreakdown = sanitizeTopicRows(row.goodWorkBreakdown);
    const badWorkBreakdown = sanitizeTopicRows(row.badWorkBreakdown);

    return {
      id: row._id || row.id || row.candidateId || row.partyId,
      entityId: row.partyId || row.candidateId || row._id || row.id,
      name: row.fullName || row.name || row.leader || "Unknown",
      party: row.partyName || row.party || row.name || "",
      votes: Number(row.totalVotes || row.currentVotes || 0).toLocaleString(),
      avatar: getPartyLogoSrc(row) || row.avatar || row.photo || row.image || row.logo || "",
      development: clampPercent(row.development ?? row.totalTaskCompletion ?? 0),
      good: clampPercent(row.goodWork ?? 0),
      bad: clampPercent(row.badWork ?? 0),
      detailedMetrics: {
        infrastructure: clampPercent(detailed.infrastructure),
        healthcare: clampPercent(detailed.healthcare),
        education: clampPercent(detailed.education),
        policyFailures: clampPercent(detailed.policyFailures),
        corruptionCases: clampPercent(detailed.corruptionCases),
        publicComplaints: clampPercent(detailed.publicComplaints),
      },
      goodTopics:
        goodWorkBreakdown.length > 0
          ? goodWorkBreakdown.map((item, index) => ({
              key: `good-${index}-${item.label}`,
              label: item.label,
              value: item.value,
            }))
          : buildTopicRows(detailed, "good"),
      badTopics:
        badWorkBreakdown.length > 0
          ? badWorkBreakdown.map((item, index) => ({
              key: `bad-${index}-${item.label}`,
              label: item.label,
              value: item.value,
            }))
          : buildTopicRows(detailed, "bad"),
      history: toHistoryRows(
        Array.isArray(row.history)
          ? row.history
          : Array.isArray(row.historicalData)
            ? row.historicalData
            : [],
      ),
    };
  };

  const loadPartiesAsFallbackAnalytics = async () => {
    const partyRes = await api.get("/parties");
    const partyList =
      partyRes.data?.data?.parties || partyRes.data?.data || partyRes.data || [];
    if (!Array.isArray(partyList) || !partyList.length) {
      setCandidates([]);
      setError("No analytics data returned yet.");
      return;
    }
    setCandidates(
      partyList.map((party) =>
        mapAnalyticsRow({
          partyId: party._id || party.id,
          name: party.name,
          leader: party.leader,
          logo: party.logo,
          development: party.development,
          goodWork: party.goodWork,
          badWork: party.badWork,
          currentVotes: party.totalVotes,
        }),
      ),
    );
    setError(null);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics/candidates");
      const list = res.data?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setCandidates(list.map(mapAnalyticsRow));
        setError(null);
      } else {
        await loadPartiesAsFallbackAnalytics();
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      if (err.isNetworkError === true) {
        setCandidates([]);
        setError("Backend offline: could not reach analytics API.");
        return;
      }

      try {
        await loadPartiesAsFallbackAnalytics();
      } catch (fallbackError) {
        console.error("Failed to load analytics fallback:", fallbackError);
        setCandidates([]);
        setError(
          err.isUnauthorized
            ? "Unauthorized: please log in as admin."
            : "Failed to load analytics data",
        );
      }
    }
  };

  useEffect(() => {
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

  const historyRows = useMemo(
    () =>
      Array.isArray(selectedCandidate?.history)
        ? selectedCandidate.history
        : [],
    [selectedCandidate],
  );

  const loadDetailedCandidate = async (candidate) => {
    if (!candidate?.entityId) return candidate;
    try {
      const res = await api.get(`/admin/analytics/party/${candidate.entityId}/detailed`);
      const data = res.data?.data || {};
      return {
        ...candidate,
        development: clampPercent(data?.overallScores?.development ?? candidate.development),
        good: clampPercent(data?.overallScores?.goodWork ?? candidate.good),
        bad: clampPercent(data?.overallScores?.badWork ?? candidate.bad),
        detailedMetrics: data?.detailedMetrics || {},
        goodTopics:
          sanitizeTopicRows(data?.goodWorkBreakdown).length > 0
            ? sanitizeTopicRows(data?.goodWorkBreakdown).map((item, index) => ({
                key: `good-${index}-${item.label}`,
                label: item.label,
                value: item.value,
              }))
            : buildTopicRows(data?.detailedMetrics, "good"),
        badTopics:
          sanitizeTopicRows(data?.badWorkBreakdown).length > 0
            ? sanitizeTopicRows(data?.badWorkBreakdown).map((item, index) => ({
                key: `bad-${index}-${item.label}`,
                label: item.label,
                value: item.value,
              }))
            : buildTopicRows(data?.detailedMetrics, "bad"),
        history: toHistoryRows(data?.historicalData),
      };
    } catch {
      return candidate;
    }
  };

  const openReport = async (candidate) => {
    const detailedCandidate = await loadDetailedCandidate(candidate);
    setSelectedCandidate(detailedCandidate);
    setShowReport(true);
  };

  const openHistory = async (candidate) => {
    const detailedCandidate = await loadDetailedCandidate(candidate);
    setSelectedCandidate(detailedCandidate);
    setShowHistory(true);
  };

  const openUpdate = async (candidate) => {
    const detailedCandidate = await loadDetailedCandidate(candidate);
    setSelectedCandidate(detailedCandidate);
    setUpdateValues({
      development: detailedCandidate.development,
      good: detailedCandidate.good,
      bad: detailedCandidate.bad,
      goodTopics: (detailedCandidate.goodTopics || []).map((item) => ({
        label: item.label,
        value: clampPercent(item.value),
      })),
      badTopics: (detailedCandidate.badTopics || []).map((item) => ({
        label: item.label,
        value: clampPercent(item.value),
      })),
    });
    setShowUpdate(true);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const addTopicRow = (mode) => {
    const key = mode === "bad" ? "badTopics" : "goodTopics";
    setUpdateValues((prev) => ({
      ...prev,
      [key]: [...(Array.isArray(prev[key]) ? prev[key] : []), { label: "", value: 0 }],
    }));
  };

  const updateTopicRow = (mode, index, field, value) => {
    const key = mode === "bad" ? "badTopics" : "goodTopics";
    setUpdateValues((prev) => ({
      ...prev,
      [key]: (Array.isArray(prev[key]) ? prev[key] : []).map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        if (field === "value") return { ...row, value: clampPercent(value) };
        return { ...row, label: value };
      }),
    }));
  };

  const removeTopicRow = (mode, index) => {
    const key = mode === "bad" ? "badTopics" : "goodTopics";
    setUpdateValues((prev) => ({
      ...prev,
      [key]: (Array.isArray(prev[key]) ? prev[key] : []).filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const saveUpdate = async () => {
    if (!selectedCandidate) return;
    try {
      const payload = {
        development: Number(updateValues.development),
        goodWork: Number(updateValues.good),
        badWork: Number(updateValues.bad),
        goodWorkBreakdown: sanitizeTopicRows(updateValues.goodTopics),
        badWorkBreakdown: sanitizeTopicRows(updateValues.badTopics),
      };

      await api.put(`/admin/analytics/party/${selectedCandidate.entityId}/update`, {
        ...payload,
      });
      await fetchAnalytics();
      const refreshed = await loadDetailedCandidate(selectedCandidate);
      setSelectedCandidate(refreshed);
      setShowUpdate(false);
      showToast("Analytics updated successfully");
    } catch (err) {
      console.error("Failed to update analytics:", err);
      alert(err.response?.data?.message || "Failed to update analytics");
    }
  };

  const removeHistoryRow = async (year) => {
    if (!selectedCandidate?.entityId || !year) return;
    try {
      await api.put(`/admin/analytics/party/${selectedCandidate.entityId}/update`, {
        deleteHistoryYear: Number(year),
      });
      const refreshed = await loadDetailedCandidate(selectedCandidate);
      setSelectedCandidate(refreshed);
      await fetchAnalytics();
      showToast("Historical record removed");
    } catch (err) {
      console.error("Failed to remove historical row:", err);
      alert(err.response?.data?.message || "Failed to remove historical data");
    }
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
            <div className="stat-label">Avg Positive Impact</div>
            <span className="stat-icon teal" aria-hidden="true">
              <i className="ri-thumb-up-line" />
            </span>
          </div>
          <div className="stat-value">{stats.avgGood}%</div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-top">
            <div className="stat-label">Avg Negative Impact</div>
            <span className="stat-icon red" aria-hidden="true">
              <i className="ri-thumb-down-line" />
            </span>
          </div>
          <div className="stat-value">{stats.avgBad}%</div>
        </div>
      </div>

      {error && (
        <div className="analytics-error">
          {error}
        </div>
      )}

      <div className="analytics-list">
        {candidates.length === 0 ? (
          <div className="analytics-empty">
            <span className="empty-icon" aria-hidden="true">
              <i className="ri-database-2-line" />
            </span>
            <div>No analytics data yet</div>
            <div className="muted">Connect backend metrics to populate this view.</div>
          </div>
        ) : (
          candidates.map((candidate) => (
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
                  <div className="candidate-votes">
                    {candidate.votes} {candidate.votes ? "votes" : ""}
                  </div>
                </div>
              </div>

              <div className="analytics-card__middle">
                <div className="metric-group">
                  <div className="metric-title">Positive Impact Performance</div>
                  <div className="metric-bar good">
                    <span style={{ width: `${candidate.good || 0}%` }} />
                  </div>
                  <ul className="good">
                    {(candidate.goodTopics || []).map((topic) => (
                      <li key={topic.key}>
                        <i className="ri-checkbox-circle-line" aria-hidden="true" />
                        <span>{topic.label}: {topic.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="metric-group">
                  <div className="metric-title">Negative Impact Performance</div>
                  <div className="metric-bar bad">
                    <span style={{ width: `${candidate.bad || 0}%` }} />
                  </div>
                  <ul className="bad">
                    {(candidate.badTopics || []).map((topic) => (
                      <li key={topic.key}>
                        <i className="ri-close-circle-line" aria-hidden="true" />
                        <span>{topic.label}: {topic.value}%</span>
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
                  <div className="circular-progress" style={{ "--value": candidate.development || 0 }}>
                    <div className="progress-value">{candidate.development || 0}%</div>
                  </div>
                  <div className="progress-label">Development</div>
                </div>
              </div>
            </div>
          ))
        )}
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
                  Positive Impact Breakdown
                </div>
                {selectedCandidate.goodTopics.map((topic) => (
                  <div key={topic.key} className="report-row">
                    <span>{topic.label}</span>
                    <span>{topic.value}%</span>
                  </div>
                ))}
              </div>
              <div className="report-box bad">
                <div className="report-title">
                  <i className="ri-thumb-down-line" aria-hidden="true" />
                  Negative Impact Breakdown
                </div>
                {selectedCandidate.badTopics.map((topic) => (
                  <div key={topic.key} className="report-row">
                    <span>{topic.label}</span>
                    <span>{topic.value}%</span>
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
                <div className="stat-label">Positive Impact</div>
              </div>
              <div>
                <div className="stat-number">{selectedCandidate.bad}%</div>
                <div className="stat-label">Negative Impact</div>
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
              {historyRows.length === 0 ? (
                <div className="history-empty">
                  <i className="ri-inbox-line" aria-hidden="true" />
                  <div>No historical data available</div>
                </div>
              ) : (
                historyRows.map((row, idx) => (
                  <div key={row.year || row.label || idx} className="history-row">
                    <div className="year-pill">{row.year || row.label || "-"}</div>
                    <div className="history-bars">
                      <div>
                        <div className="stat-label">Development</div>
                        <div className="metric-bar good">
                          <span style={{ width: `${row.development || 0}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="stat-label">Positive Impact</div>
                        <div className="metric-bar good">
                          <span style={{ width: `${row.goodWork || 0}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="stat-label">Negative Impact</div>
                        <div className="metric-bar bad">
                          <span style={{ width: `${row.badWork || 0}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="history-votes">
                      <div>{Number(row.votes || 0).toLocaleString()} votes</div>
                      {row.year ? (
                        <button
                          type="button"
                          className="admin-button ghost"
                          onClick={() => removeHistoryRow(row.year)}
                        >
                          <i className="ri-delete-bin-line" aria-hidden="true" />
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
            {historyRows.length > 0 && (
              <div className="trend-box">
                <i className="ri-line-chart-line" aria-hidden="true" />
                Development trend will appear once history is populated.
              </div>
            )}
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
              <div className="slider-label">Positive Impact: {updateValues.good}%</div>
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
              <div className="slider-label">Negative Impact: {updateValues.bad}%</div>
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
            <div className="topic-editor">
              <div className="slider-label">Positive Impact Breakdown</div>
              <div className="topic-editor-list">
                {(updateValues.goodTopics || []).map((row, index) => (
                  <div key={`good-topic-${index}`} className="topic-editor-row">
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateTopicRow("good", index, "label", e.target.value)}
                      placeholder="Topic name (e.g. Infrastructure)"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.value}
                      onChange={(e) => updateTopicRow("good", index, "value", e.target.value)}
                      placeholder="0"
                    />
                    <button
                      type="button"
                      className="admin-button ghost topic-remove-btn"
                      onClick={() => removeTopicRow("good", index)}
                    >
                      <i className="ri-delete-bin-line" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button type="button" className="admin-button ghost topic-add-btn" onClick={() => addTopicRow("good")}>
                  <i className="ri-add-line" aria-hidden="true" />
                  Add Positive Impact Topic
                </button>
              </div>
            </div>
            <div className="topic-editor">
              <div className="slider-label">Negative Impact Breakdown</div>
              <div className="topic-editor-list">
                {(updateValues.badTopics || []).map((row, index) => (
                  <div key={`bad-topic-${index}`} className="topic-editor-row">
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateTopicRow("bad", index, "label", e.target.value)}
                      placeholder="Topic name (e.g. Policy failures)"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.value}
                      onChange={(e) => updateTopicRow("bad", index, "value", e.target.value)}
                      placeholder="0"
                    />
                    <button
                      type="button"
                      className="admin-button ghost topic-remove-btn"
                      onClick={() => removeTopicRow("bad", index)}
                    >
                      <i className="ri-delete-bin-line" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button type="button" className="admin-button ghost topic-add-btn" onClick={() => addTopicRow("bad")}>
                  <i className="ri-add-line" aria-hidden="true" />
                  Add Negative Impact Topic
                </button>
              </div>
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

