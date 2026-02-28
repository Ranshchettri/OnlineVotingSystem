import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Emblem from "../assets/nepal-emblem.svg";
import "../styles/landing.css";

export default function AccessLanding() {
  const nav = useNavigate();
  const [showRoleOptions, setShowRoleOptions] = useState(false);

  return (
    <div className="landing-shell">
      <div className="landing-card">
        <div className="landing-image-wrap">
          <img src={Emblem} alt="Nepal Government Emblem" className="landing-image" />
        </div>
        <h1>Nepal Online Voting System</h1>
        <p>Secure and transparent digital election platform.</p>

        {!showRoleOptions ? (
          <button
            type="button"
            className="landing-start-btn"
            onClick={() => setShowRoleOptions(true)}
          >
            Get Started
          </button>
        ) : (
          <div className="landing-role-panel">
            <p className="landing-role-title">Choose login portal</p>
            <div className="landing-role-grid">
              <button
                type="button"
                className="landing-role-btn admin"
                onClick={() => nav("/admin/login")}
              >
                Admin Login
              </button>
              <button
                type="button"
                className="landing-role-btn voter"
                onClick={() => nav("/voter/login")}
              >
                Voter Login
              </button>
              <button
                type="button"
                className="landing-role-btn party"
                onClick={() => nav("/party/login")}
              >
                Party Login
              </button>
            </div>
            <button
              type="button"
              className="landing-back-btn"
              onClick={() => setShowRoleOptions(false)}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
