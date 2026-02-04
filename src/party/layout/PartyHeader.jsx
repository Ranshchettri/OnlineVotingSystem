export default function PartyHeader() {
  return (
    <header className="party-topbar">
      <div className="party-brand">
        <div className="party-brand-logo">
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
          <div className="party-brand-title">Party Portal</div>
          <div className="party-brand-sub">Political Party Management</div>
        </div>
      </div>

      <div className="party-switcher">
        <button type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
            <path d="M4 21c1.8-4 5-6 8-6s6.2 2 8 6" />
          </svg>
          Admin
        </button>
        <button type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="7" r="4" />
            <path d="M4 21c1.8-4 5-6 8-6s6.2 2 8 6" />
          </svg>
          Voter
        </button>
        <button type="button" className="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
          Party
        </button>
      </div>

      <div className="party-top-actions">
        <span className="party-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          Official Party Account
        </span>
        <button type="button" className="party-logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 17l5-5-5-5" />
            <path d="M3 12h12" />
            <path d="M14 3h7v18h-7" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
