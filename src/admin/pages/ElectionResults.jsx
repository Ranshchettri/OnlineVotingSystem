import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { getPartyShortLabel } from "../../shared/utils/partyDisplay";
import "../styles/electionResults.css";

const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function ElectionResults() {
  const { electionId } = useParams();
  const [summary, setSummary] = useState(null);
  const [coalitionData, setCoalitionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ensure result is calculated/published for this election
        await api.get(`/results/admin/${electionId}`);

        const [summaryRes, coalitionRes] = await Promise.all([
          api.get(`/results/${electionId}`),
          api.get(`/results/coalitions/${electionId}`).catch(() => null),
        ]);

        setSummary(summaryRes.data?.data || null);
        setCoalitionData(coalitionRes?.data?.data || null);
      } catch (err) {
        console.error("Failed to fetch election result summary:", err);
        setError(err.response?.data?.message || "Failed to load election results");
      } finally {
        setLoading(false);
      }
    };

    if (electionId) fetchResults();
  }, [electionId]);

  const prResult = summary?.prResult || {};
  const standings = useMemo(
    () =>
      Array.isArray(prResult.standings)
        ? [...prResult.standings].sort((a, b) => {
            const seatDiff = toNumber(b.seats) - toNumber(a.seats);
            if (seatDiff !== 0) return seatDiff;
            return toNumber(b.votes) - toNumber(a.votes);
          })
        : [],
    [prResult.standings],
  );

  const coalitionSuggestions =
    coalitionData?.coalitionSuggestions ||
    prResult?.coalitionSuggestions ||
    [];
  const majority = coalitionData?.majority || prResult?.majority || {};
  const majorityMark = toNumber(coalitionData?.majorityMark || prResult?.majorityMark);

  if (loading) {
    return (
      <div className="election-results">
        <div className="loading">Loading election results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="election-results">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="election-results">
        <div className="no-data">No results available for this election.</div>
      </div>
    );
  }

  return (
    <div className="election-results">
      <div className="election-results__head">
        <h1>{summary.title || "Election Results"}</h1>
        <p>Election ID: {summary.electionId || electionId}</p>
      </div>

      <div className="summary-stats">
        <div className="stat-box">
          <span className="stat-label">Election System</span>
          <span className="stat-value">{summary.electionSystem || "FPTP"}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Total Votes</span>
          <span className="stat-value">{toNumber(summary.totalVotes).toLocaleString()}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Total Seats</span>
          <span className="stat-value">{toNumber(summary.totalSeats).toLocaleString()}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Majority Mark</span>
          <span className="stat-value">{majorityMark.toLocaleString()}</span>
        </div>
      </div>

      <div className="results-container">
        <div className="admin-card election-results__majority">
          <h2>Majority Status</h2>
          <p className="majority-type">{majority?.type || "Coalition Required"}</p>
          <div className="majority-meta">
            {majority?.partyName ? (
              <span>{majority.partyName}</span>
            ) : (
              <span>No single-party majority</span>
            )}
            <strong>{toNumber(majority?.seats)} seats</strong>
          </div>
        </div>

        <div className="admin-card">
          <h2>Party Seat Allocation</h2>
          {standings.length === 0 ? (
            <p className="no-data">No party standings available.</p>
          ) : (
            <div className="standings-table">
              <div className="standings-row standings-head">
                <span>Party</span>
                <span>Votes</span>
                <span>Vote %</span>
                <span>Seats</span>
              </div>
              {standings.map((item) => (
                <div
                  key={`${item.partyId || item.partyName}`}
                  className={`standings-row ${item.partyId === majority?.partyId ? "winner" : ""}`}
                >
                  <span>{item.partyName || getPartyShortLabel(item, "Party")}</span>
                  <span>{toNumber(item.votes).toLocaleString()}</span>
                  <span>{toNumber(item.votePercentage).toFixed(2)}%</span>
                  <span>{toNumber(item.seats)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          <h2>Coalition Suggestions</h2>
          {coalitionSuggestions.length === 0 ? (
            <p className="no-data">No coalition combinations required or available.</p>
          ) : (
            <div className="coalition-list">
              {coalitionSuggestions.map((item, idx) => (
                <div key={`${item.partyNames?.join("-") || idx}`} className="coalition-item">
                  <div>
                    <strong>{(item.partyNames || []).join(" + ") || "Combination"}</strong>
                    <p>{item.note || "Possible coalition option"}</p>
                  </div>
                  <span>{toNumber(item.totalSeats)} seats</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
