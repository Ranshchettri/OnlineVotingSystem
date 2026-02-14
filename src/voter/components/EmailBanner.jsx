export default function EmailBanner({ visible, partyName }) {
  if (!visible) return null;

  return (
    <div className="email-banner">
      <span className="email-banner-icon">
        <i className="ri-mail-check-line" aria-hidden="true" />
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
