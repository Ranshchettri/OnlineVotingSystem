import { currentElection, pastResults } from "../data/fakeVoterData";
import "../styles/results.css";

export default function Results() {
  return (
    <div>
      <div className="results-header">
        <h1>Election Results</h1>
        <p>Current and historical election outcomes</p>
      </div>

      <div className="results-current">
        <div>
          <h2>{currentElection.title}</h2>
          <div className="results-current-status">
            <span />
            {currentElection.status}
          </div>
        </div>
        <div className="results-current-right">
          <div className="results-current-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19h16" />
              <rect x="6" y="7" width="4" height="9" />
              <rect x="14" y="10" width="4" height="6" />
            </svg>
          </div>
          <p>{currentElection.note}</p>
        </div>
      </div>

      <div className="results-section">
        <h3>Past Election Results</h3>
        <p>Historical winners from the last 5 elections</p>

        {pastResults.map((result) => (
          <div key={result.id} className="result-card">
            <div className="result-card-header">
              <div>
                <h4>{result.title}</h4>
                <span>Year: {result.year}</span>
              </div>
              <span className="result-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                  <path d="M7 4h10v4H7z" />
                  <path d="M6 8h12l-1 5H7z" />
                </svg>
                Winner
              </span>
            </div>

            <div className="result-body">
              <div className="result-winner">
                <div className="result-logo" style={{ background: result.color }}>
                  <span>{result.short}</span>
                </div>
                <div className="result-info">
                  <h5>{result.winner}</h5>
                  <div className="result-stats">
                    <div>
                      <span>Total Votes</span>
                      <strong>{result.winnerVotes}</strong>
                    </div>
                    <div className="result-divider" />
                    <div>
                      <span>Runner-up</span>
                      <strong>{result.runnerUp}</strong>
                      <small>{result.runnerUpVotes} votes</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="result-margin">
                <span>Victory Margin</span>
                <strong>{result.margin}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
