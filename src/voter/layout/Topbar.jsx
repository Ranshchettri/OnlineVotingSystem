import { voterProfile } from "../data/fakeVoterData";

export default function Topbar() {
  return (
    <header className="voter-topbar">
      <div className="voter-brand">
        <div className="voter-brand-logo">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l8 3v6c0 5-3.2 9.4-8 11-4.8-1.6-8-6-8-11V5l8-3z"
              fill="#1E4F93"
            />
              <path
                d="M12 4l6 2.2V11c0 4-2.4 7.4-6 8.8-3.6-1.4-6-4.8-6-8.8V6.2L12 4z"
                fill="#E24C3B"
              />
              <path
                d="M12 6l4 1.5V11c0 3.1-1.8 5.8-4 6.8-2.2-1-4-3.7-4-6.8V7.5L12 6z"
                fill="#FFFFFF"
            />
          </svg>
        </div>
        <div>
          <p className="voter-brand-title">Voter Portal</p>
          <p className="voter-brand-subtitle">Nepal Online Voting System</p>
        </div>
      </div>

      <div className="voter-topbar-actions">
        <span className="voter-badge">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6l-8 8-4-4" />
            </svg>
            {voterProfile.status}
        </span>
        <button className="voter-logout" type="button">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10 17l5-5-5-5" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
