import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";

export default function PartyCard({ party, hasVoted, isVotedParty, onVote }) {
  const isDisabled = hasVoted && !isVotedParty;
  const voteLabel = isVotedParty
    ? "Your Vote ✓"
    : hasVoted
      ? "Already Voted"
      : "Vote for This Party";

  const voteClass = isVotedParty
    ? "voted"
    : hasVoted
      ? "disabled"
      : "";

  return (
    <div
      className={`party-card ${isVotedParty ? "voted" : ""} ${
        isDisabled ? "disabled" : ""
      }`}
    >
      <div className="party-logo" style={{ background: party.color }}>
        <span className="party-logo-text">{party.short}</span>
        <span className="party-rank">#{party.rank}</span>
        {isVotedParty ? (
          <span className="party-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6l-8 8-4-4" />
            </svg>
          </span>
        ) : null}
      </div>

      <div className="party-content">
        <div className="party-header">
          <div>
            <p className="party-name">{party.name}</p>
            <p className="party-leader">Leader: {party.leader}</p>
          </div>
          <Link className="party-view-btn" to={`/voter/party/${party.id}`}>
            View Profile
          </Link>
        </div>

        <div className="party-meta">
          <div>
            <span>Current Votes</span>
            <strong>{party.votes}</strong>
          </div>
          <div>
            <span>Vote Share</span>
            <strong>{party.share}</strong>
          </div>
          <div>
            <span>Development Score</span>
            <div className="party-progress-row">
              <ProgressBar value={party.score} />
              <span className="party-score">{party.score}%</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (hasVoted ? null : onVote(party))}
          className={`party-vote-btn ${voteClass}`}
          disabled={hasVoted && !isVotedParty}
        >
          {voteLabel}
        </button>
      </div>
    </div>
  );
}
