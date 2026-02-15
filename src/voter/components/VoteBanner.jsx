export default function VoteBanner({ hasVoted }) {
  return (
    <div className="vote-banner">
      <div>
        <h2>{hasVoted ? "Thank You for Voting!" : "Cast Your Vote"}</h2>
        <p>
          {hasVoted
            ? "Your vote has been recorded successfully."
            : "Select a party below to cast your vote securely. Face check is powered by the Ready AI demo verifier."}
        </p>
      </div>
      <div className="vote-banner-icon">
        {hasVoted ? (
          <i className="ri-checkbox-circle-line" aria-hidden="true" />
        ) : (
          <i className="ri-vote-line" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
