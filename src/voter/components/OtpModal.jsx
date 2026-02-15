import { useEffect, useRef } from "react";

export default function OtpModal({
  isOpen,
  partyName,
  otpValue,
  onChange,
  faceVerified = false,
  error,
  onClose,
  onConfirm,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="otp-backdrop">
      <div className="otp-modal">
        <h3>
          <i className="ri-shield-keyhole-line" aria-hidden="true" /> Confirm Your Vote
        </h3>
        <p>
          Enter the OTP sent to your email/phone to vote for{" "}
          <strong>{partyName}</strong>.
        </p>

        <div className="otp-hint">
          <i className="ri-mail-line" aria-hidden="true" />
          Demo OTP for testing: 12345
        </div>

        {faceVerified ? (
          <div className="state-chip success" style={{ marginTop: 10 }}>
            <i className="ri-checkbox-circle-line" aria-hidden="true" />
            Face verified. Continue with OTP.
          </div>
        ) : (
          <div className="state-chip warn" style={{ marginTop: 10 }}>
            <i className="ri-error-warning-line" aria-hidden="true" />
            Complete face verification before submitting OTP.
          </div>
        )}

        <div>
          <label>OTP Code</label>
          <input
            ref={inputRef}
            type="text"
            value={otpValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirm();
            }}
            className="otp-input"
            placeholder="Enter 5-digit OTP"
            disabled={!faceVerified}
          />
          {error ? <p className="otp-error">{error}</p> : null}
        </div>

        <div className="otp-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="primary"
            disabled={!faceVerified}
          >
            Submit Vote
          </button>
        </div>
      </div>
    </div>
  );
}
