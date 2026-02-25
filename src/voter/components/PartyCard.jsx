import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";

export default function PartyCard({
  party,
  hasVoted,
  isVotedParty,
  disableVoting = false,
  onVote,
}) {
  const isDisabled = (hasVoted && !isVotedParty) || disableVoting;
  const voteLabel = isVotedParty
    ? "Your Vote"
    : hasVoted
      ? "Already Voted"
      : disableVoting
        ? "Voting Closed"
        : "Vote for This Party";

  const voteClass = isVotedParty
    ? "voted"
    : hasVoted || disableVoting
      ? "disabled"
      : "";

  return (
    <div
      className={`party-card ${isVotedParty ? "voted" : ""} ${
        isDisabled ? "disabled" : ""
      }`}
    >
      <div className="party-logo" style={{ background: party.color }}>
        {party.logo ? (
          <img src={party.logo} alt={party.name} className="party-logo-img" />
        ) : (
          <span className="party-logo-text">
            {party.short || party.shortName || party.symbol || party.name?.slice(0, 3)}
          </span>
        )}
        <span className="party-rank">#{party.rank}</span>
        {isVotedParty ? (
          <span className="party-check">
            <i className="ri-checkbox-circle-line" aria-hidden="true" />
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
          onClick={() => (isDisabled ? null : onVote(party))}
          className={`party-vote-btn ${voteClass}`}
          disabled={isDisabled}
        >
          <span className="party-vote-icon">
            <i
              className={
                isVotedParty
                  ? "ri-checkbox-circle-line"
                  : hasVoted
                    ? "ri-close-circle-line"
                    : "ri-vote-line"
              }
              aria-hidden="true"
            />
          </span>
          {voteLabel}
        </button>
      </div>
    </div>
  );
}
