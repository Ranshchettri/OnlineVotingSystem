import { useNavigate } from "react-router-dom";
import Emblem from "../assets/nepal-emblem.svg";
import "../styles/landing.css";

export default function AccessLanding() {
  const nav = useNavigate();

  return (
    <div className="landing-shell">
      <div className="landing-card">
        <div className="landing-image-wrap">
          <img src={Emblem} alt="Nepal Government Emblem" className="landing-image" />
        </div>
        <h1>Nepal Online Voting System</h1>
        <p>Secure and transparent digital election platform.</p>
        <button
          type="button"
          className="landing-start-btn"
          onClick={() => nav("/voter/login")}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
