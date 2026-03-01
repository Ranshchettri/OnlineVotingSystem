import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { getPartyLogoSrc, getPartyShortLabel } from "../../shared/utils/partyDisplay";

export default function PartyCard({
  party,
  hasVoted,
  isVotedParty,
  disableVoting = false,
  onVote,
}) {
  const isDisabled = hasVoted || disableVoting;
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
  const logoSrc = getPartyLogoSrc(party);
  const shortLabel = getPartyShortLabel(party, "PRT");

  return (
    <div
      className={`vparty-card ${isVotedParty ? "voted" : ""} ${
        isDisabled ? "disabled" : ""
      }`}
    >
      <div className="vparty-logo" style={{ background: party.color }}>
        {logoSrc ? (
          <img src={logoSrc} alt={party.name} className="vparty-logo-img" />
        ) : (
          <span className="vparty-logo-text">
            {shortLabel}
          </span>
        )}
        <span className="vparty-rank">#{party.rank}</span>
        {isVotedParty ? (
          <span className="vparty-check">
            <i className="ri-checkbox-circle-line" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <div className="vparty-content">
        <div className="vparty-header">
          <div>
            <p className="vparty-name">{party.name}</p>
            <p className="vparty-leader">Leader: {party.leader}</p>
          </div>
          <Link className="vparty-view-btn" to={`/voter/party/${party.id}`}>
            View Profile
          </Link>
        </div>

        <div className="vparty-meta">
          <div>
            <span>Current Votes</span>
            <strong>{party.votes}</strong>
          </div>
          <div>
            <span>Vote Share</span>
            <strong>{party.share}</strong>
          </div>
          <div>
            <div className="vparty-dev-head">
              <span>Development Score</span>
              <strong>{party.score}%</strong>
            </div>
            <div className="vparty-progress-row">
              <ProgressBar value={party.score} />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (isDisabled ? null : onVote(party))}
          className={`vparty-vote-btn ${voteClass}`}
          disabled={isDisabled}
        >
          <span className="vparty-vote-icon">
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
