export default function VoteBanner({ hasVoted }) {
  return (
    <div className="vote-banner">
      <div>
        <h2>{hasVoted ? "Thank You for Voting!" : "Cast Your Vote"}</h2>
        <p>
          {hasVoted
            ? "Your vote has been recorded successfully."
            : "Select a party below to cast your vote securely"}
        </p>
      </div>
      <div className="vote-banner-icon">
        {hasVoted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6l-8 8-4-4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="3" width="16" height="6" rx="1" />
            <path d="M8 9v12h8V9" />
            <path d="M12 13v4" />
          </svg>
        )}
      </div>
    </div>
  );
}
