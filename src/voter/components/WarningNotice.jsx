export default function WarningNotice() {
  return (
    <div className="warning-notice">
      <span className="warning-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.3 4.4L2.3 18a1 1 0 0 0 .9 1.5h17.6a1 1 0 0 0 .9-1.5l-8-13.6a1 1 0 0 0-1.7 0z" />
        </svg>
      </span>
      <p>
        Important Notice: Once submitted, your vote cannot be changed. Please
        review your selection carefully before confirming.
      </p>
    </div>
  );
}
