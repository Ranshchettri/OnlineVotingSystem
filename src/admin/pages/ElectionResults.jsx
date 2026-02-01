import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import "../styles/electionResults.css";

export default function ElectionResults() {
  const { electionId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/results/admin/${electionId}`);
        setResults(res.data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError(
          err.response?.data?.message || "Failed to load election results",
        );
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    if (electionId) {
      fetchResults();
    }
  }, [electionId]);

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

  if (!results) {
    return (
      <div className="election-results">
        <div className="no-data">No results available for this election</div>
      </div>
    );
  }

  return (
    <div className="election-results">
      <h1>Election Results</h1>
      <p className="election-id">Election ID: {electionId}</p>

      <div className="results-container">
        {/* Winners Section */}
        <div className="winners-section">
          <h2>🏆 Winner(s)</h2>
          {results.winnerIds && results.winnerIds.length > 0 ? (
            <div className="winners-grid">
              {results.winnerIds.map((winnerId) => {
                const winnerData = results.results?.find(
                  (r) => r.candidateId === winnerId,
                );
                return (
                  <div key={winnerId} className="winner-card">
                    <div className="winner-badge">🥇</div>
                    <h3>{winnerData?.candidateName || winnerId}</h3>
                    <p className="winner-votes">
                      {winnerData?.totalVotes || 0} votes
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-data">No winner declared yet</p>
          )}
        </div>

        {/* All Results Section */}
        <div className="all-results-section">
          <h2>📊 All Results</h2>
          {results.results && results.results.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Candidate ID</th>
                  <th>Total Votes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.results
                  .sort((a, b) => b.totalVotes - a.totalVotes)
                  .map((result) => {
                    const isWinner = results.winnerIds?.includes(
                      result.candidateId,
                    );
                    return (
                      <tr
                        key={result.candidateId}
                        className={isWinner ? "winner-row" : ""}
                      >
                        <td className="candidate-name">
                          {result.candidateName}
                        </td>
                        <td>{result.candidateId}</td>
                        <td className="votes-count">{result.totalVotes}</td>
                        <td>
                          <span
                            className={`status ${isWinner ? "status-winner" : "status-participant"}`}
                          >
                            {isWinner ? "🏆 Winner" : "Participant"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No results available</p>
          )}
        </div>

        {/* Tie Information */}
        {results.isTie && (
          <div className="alert-info">
            <strong>ℹ️ Notice:</strong> This election resulted in a tie between
            multiple candidates.
          </div>
        )}

        {/* Summary Stats */}
        <div className="summary-stats">
          <div className="stat-box">
            <span className="stat-label">Total Candidates</span>
            <span className="stat-value">{results.results?.length || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Total Votes Cast</span>
            <span className="stat-value">
              {results.results?.reduce(
                (sum, r) => sum + (r.totalVotes || 0),
                0,
              ) || 0}
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Winners Declared</span>
            <span className="stat-value">{results.winnerIds?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
