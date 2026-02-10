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
          <i className="ri-shield-check-line" aria-hidden="true" />
          Official Party Account
        </span>
        <button type="button" className="party-logout">
          <i className="ri-logout-box-line" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  );
}
