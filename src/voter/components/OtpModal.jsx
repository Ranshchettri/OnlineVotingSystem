import { useEffect, useRef } from "react";

export default function OtpModal({
  isOpen,
  partyName,
  otpValue,
  onChange,
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
        <h3>Confirm Your Vote</h3>
        <p>
          Enter the OTP sent to your email/phone to vote for{" "}
          <strong>{partyName}</strong>.
        </p>

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
          />
          {error ? <p className="otp-error">{error}</p> : null}
        </div>

        <div className="otp-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="primary">
            Submit Vote
          </button>
        </div>
      </div>
    </div>
  );
}
