import { useNavigate } from "react-router-dom";
import Emblem from "../../assets/nepal-emblem.svg";
import { getStoredVoter } from "../utils/user";

export default function Topbar() {
  const navigate = useNavigate();
  const voter = getStoredVoter();
  const rawStatus = String(voter?.verificationStatus || "").toLowerCase();
  const blocked = ["blocked", "rejected"].includes(rawStatus);
  const status = blocked ? rawStatus.toUpperCase() : "Verified Voter";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("voter");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/voter/login");
  };

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
          <i className="ri-shield-line" aria-hidden="true" />
          {status}
        </span>
        <button className="voter-logout" type="button" onClick={logout}>
          <i className="ri-logout-box-line" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  );
}
