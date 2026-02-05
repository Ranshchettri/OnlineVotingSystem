import { voterProfile } from "../data/fakeVoterData";
import Emblem from "../../assets/nepal-emblem.svg";

export default function Topbar() {
  return (
    <header className="voter-topbar">
      <div className="voter-brand">
        <div className="voter-brand-logo">
          <img src={Emblem} alt="Government of Nepal" />
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
