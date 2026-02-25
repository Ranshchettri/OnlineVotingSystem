import { usePartyData } from "../hooks/usePartyData";
import Emblem from "../../assets/nepal-emblem.svg";

export default function PartyHeader() {
  const { party } = usePartyData();
  const logo = party?.logo || party?.symbol || Emblem;
  const title = party?.name || "Party Portal";

  return (
    <header className="party-topbar">
      <div className="party-brand">
        <div className="party-brand-logo">
          <img src={logo} alt={title} />
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
        <button type="button" className="party-logout">
          <i className="ri-logout-box-line" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  );
}
