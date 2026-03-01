import { useNavigate } from "react-router-dom";
import emblem from "../assets/nepal-emblem.svg";
import "../styles/landing.css";

export default function AccessLanding() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <div className="landing-brand">
          <img src={emblem} alt="Nepal emblem" />
          <div>
            <h1>Nepal Online Voting System</h1>
            <p>Election Commission of Nepal</p>
          </div>
        </div>
        <button type="button" className="landing-login-link" onClick={() => navigate("/voter/login")}>
          Login
        </button>
      </header>

      <main className="landing-hero">
        <div className="landing-overlay" />
        <div className="landing-content">
          <span className="landing-chip">National Digital Voting Platform</span>
          <h2>Your Vote Shapes Nepal&apos;s Future</h2>
          <p>
            Secure, transparent, and real-time election platform for voters, parties, and
            administrators.
          </p>
          <div className="landing-actions">
            <button type="button" className="landing-primary" onClick={() => navigate("/voter/login")}>
              Get Started
            </button>
            <button type="button" className="landing-secondary" onClick={() => navigate("/party/login")}>
              Party Portal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
