export default function EmailBanner({ visible, partyName }) {
  if (!visible) return null;

  return (
    <div className="email-banner">
      <span className="email-banner-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16v16H4z" />
          <path d="M4 6l8 6 8-6" />
          <path d="M8 13l4 3 4-3" />
        </svg>
      </span>
      <div>
        <h4>Email Confirmation Sent!</h4>
        <p>
          You voted for <strong>{partyName}</strong>.
        </p>
        <p>Please check your inbox for confirmation.</p>
      </div>
    </div>
  );
}
