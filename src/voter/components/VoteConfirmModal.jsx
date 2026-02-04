import { voterProfile, electionOverview } from "../data/fakeVoterData";

export default function VoteConfirmModal({
  isOpen,
  party,
  onCancel,
  onProceed,
}) {
  if (!isOpen || !party) return null;

  return (
    <div className="otp-backdrop">
      <div className="vote-modal">
        <div className="vote-modal-header">
          <div className="vote-modal-logo">
            <span>{party.short}</span>
          </div>
          <div className="vote-modal-title">
            <p>You are voting for</p>
            <h3>{party.name}</h3>
            <span>Leader: {party.leader}</span>
          </div>
        </div>

        <div className="vote-modal-body">
          <div className="vote-warning">
            <span className="vote-warning-icon">!</span>
            <div>
              <h4>Final Warning</h4>
              <p>
                Once submitted, your vote <strong>CANNOT</strong> be changed.
                Please verify your selection carefully before proceeding.
              </p>
            </div>
          </div>

          <div className="vote-summary">
            <h4>Vote Confirmation</h4>
            <div className="vote-summary-row">
              <span>Selected Party:</span>
              <strong>{party.name}</strong>
            </div>
            <div className="vote-summary-row">
              <span>Election:</span>
              <strong>{electionOverview.electionName}</strong>
            </div>
            <div className="vote-summary-row">
              <span>Voter ID:</span>
              <strong>{voterProfile.id}</strong>
            </div>
          </div>

          <div className="vote-email">
            <div className="vote-email-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4z" />
                <path d="M4 6l8 6 8-6" />
              </svg>
            </div>
            <div>
              <h4>Email Confirmation</h4>
              <p>
                After voting, you will receive an email confirmation at your
                registered email address.
              </p>
            </div>
          </div>

          <div className="vote-actions">
            <button type="button" className="vote-btn secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="vote-btn primary" onClick={onProceed}>
              Proceed to Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
