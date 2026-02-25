import Emblem from "../../assets/nepal-emblem.svg";
import { getStoredVoter } from "../utils/user";

export default function Topbar() {
  const voter = getStoredVoter();
  return (
    <header className="voter-topbar">
      <div className="voter-brand">
        <div className="voter-brand-logo">
          <img src={Emblem} alt="Government of Nepal" />
        </div>
        <div>
          <p className="voter-brand-title">Voter Portal</p>
          <p className="voter-brand-subtitle">{voter?.email || "Nepal Online Voting System"}</p>
        </div>
      </div>

      <div className="voter-topbar-actions">
        <span className="voter-badge">
            <i className="ri-checkbox-circle-line" aria-hidden="true" />
            {voter?.status || "Verified Voter"}
        </span>
        <button className="voter-logout" type="button">
          <i className="ri-logout-box-line" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  );
}
