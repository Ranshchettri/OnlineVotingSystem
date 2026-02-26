import { usePartyData } from "../hooks/usePartyData";
import Emblem from "../../assets/nepal-emblem.svg";

export default function PartyHeader() {
  const { party } = usePartyData();
  const logo = party?.logo || party?.symbol || Emblem;
  const title = party?.name || "Party Portal";
  const showImage = typeof logo === "string" && (logo.startsWith("data:") || logo.startsWith("http"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("party");
    window.location.href = "/party/login";
  };

  return (
    <header className="party-topbar">
      <div className="party-brand">
        <div className="party-brand-logo">
          {showImage ? <img src={logo} alt={title} /> : <span>{party?.shortName || party?.symbol || "P"}</span>}
        </div>
        <div>
          <div className="party-brand-title">{title}</div>
          <div className="party-brand-sub">Political Party Management</div>
        </div>
      </div>

      <div className="party-top-actions">
        <span className="party-badge">
          <i className="ri-shield-check-line" aria-hidden="true" />
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
