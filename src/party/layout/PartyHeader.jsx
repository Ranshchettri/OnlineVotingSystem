import Emblem from "../../assets/nepal-emblem.svg";

export default function PartyHeader() {
  return (
    <header className="party-topbar">
      <div className="party-brand">
        <div className="party-brand-logo">
          <img src={Emblem} alt="Government of Nepal" />
        </div>
        <div>
          <div className="party-brand-title">Party Portal</div>
          <div className="party-brand-sub">Political Party Management</div>
        </div>
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
