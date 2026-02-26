import Emblem from "../../assets/nepal-emblem.svg";

export default function PartyHeader() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("party");
    window.location.href = "/party/login";
  };

  return (
    <header className="party-topbar">
      <div className="party-brand">
        <div className="party-brand-logo">
          <img src={Emblem} alt="Nepal emblem" />
        </div>
        <div>
          <div className="party-brand-title">Party Portal</div>
          <div className="party-brand-sub">Political Party Management</div>
        </div>
      </div>

      <div className="party-top-actions">
        <span className="party-badge">
          <i className="ri-shield-line" aria-hidden="true" />
          Official Party Account
        </span>
        <button type="button" className="party-logout" onClick={handleLogout}>
          <i className="ri-logout-box-line" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  );
}
