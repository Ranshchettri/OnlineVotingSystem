export default function WarningNotice() {
  return (
    <div className="warning-notice">
      <span className="warning-icon">
        <i className="ri-error-warning-line" aria-hidden="true" />
      </span>
      <p>
        Important Notice: Once submitted, your vote cannot be changed. Please
        review your selection carefully before confirming.
      </p>
    </div>
  );
}
