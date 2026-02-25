export default function VoteBanner({ hasVoted, isVotingOpen = true }) {
  const title = hasVoted
    ? "Thank You for Voting!"
    : isVotingOpen
      ? "Cast Your Vote"
      : "Voting is Closed";

  const description = hasVoted
    ? "Your vote has been recorded successfully."
    : isVotingOpen
      ? "Select a party below to cast your vote securely. Face verification runs before your final confirmation."
      : "Election is not currently active. You can still review parties and timeline details.";

  return (
    <div className="vote-banner">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
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
