import { useNavigate } from "react-router-dom";
import emblem from "../assets/nepal-emblem.svg";
import heroImage from "../assets/parliament-login-clear.jpg";
import "../styles/landing.css";

export default function AccessLanding() {
  const navigate = useNavigate();
  const scrollToId = (id) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
        <div className="landing-nav landing-nav-center">
          <button type="button" className="landing-nav-btn" onClick={() => scrollToId("landing-features")}>
            Features
          </button>
          <button type="button" className="landing-nav-btn" onClick={() => scrollToId("landing-about")}>
            About
          </button>
          <button type="button" className="landing-nav-btn" onClick={() => scrollToId("landing-portals")}>
            Portals
          </button>
        </div>
        <div className="landing-topbar-spacer" aria-hidden="true" />
      </header>

      <main className="landing-hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="landing-overlay" />
        <div className="landing-content">
          <span className="landing-chip">National Digital Voting Platform • Nepal</span>
          <h2>Your Vote Shapes Nepal&apos;s Future</h2>
          <p>
            Secure, transparent, and real-time election platform for voters, parties, and
            administrators.
          </p>
          <div className="landing-actions">
            <button type="button" className="landing-primary" onClick={() => scrollToId("landing-portals")}>
              Get Started
            </button>
          </div>
        </div>
      </main>

      <section className="landing-section" id="landing-features">
        <div className="landing-section-head">
          <h3>Core Features</h3>
          <p>Built for secure, transparent, and accountable digital elections.</p>
        </div>
        <div className="landing-feature-grid">
          <article>
            <i className="ri-shield-check-line" aria-hidden="true" />
            <h4>Role-Based Security</h4>
            <p>Admin, Voter, and Party access are isolated with JWT-backed protected routing.</p>
          </article>
          <article>
            <i className="ri-bar-chart-grouped-line" aria-hidden="true" />
            <h4>Real-Time Analytics</h4>
            <p>Live election stats, party progress metrics, and performance dashboards.</p>
          </article>
          <article>
            <i className="ri-database-2-line" aria-hidden="true" />
            <h4>MongoDB Data Store</h4>
            <p>Election records, profiles, votes, and notifications are persisted centrally.</p>
          </article>
        </div>
      </section>

      <section className="landing-section landing-section-alt" id="landing-about">
        <div className="landing-section-head">
          <h3>About The Project</h3>
          <p>
            Nepal Online Voting System modernizes democratic participation with a secure
            multi-portal experience and auditable backend workflows.
          </p>
        </div>
        <div className="landing-about-points">
          <p><strong>Transparent:</strong> Election lifecycle and outcomes are visible in role dashboards.</p>
          <p><strong>Secure:</strong> OTP, session token control, and guarded route architecture.</p>
          <p><strong>Scalable:</strong> Modular frontend + API backend designed for national expansion.</p>
        </div>
      </section>

      <section className="landing-section" id="landing-portals">
        <div className="landing-section-head">
          <h3>Choose Your Portal</h3>
          <p>Select your role to continue into the platform.</p>
        </div>
        <div className="landing-portal-grid">
          <button type="button" onClick={() => navigate("/voter/login")}>
            <i className="ri-user-3-line" aria-hidden="true" />
            <span>Voter Portal</span>
          </button>
          <button type="button" onClick={() => navigate("/party/login")}>
            <i className="ri-flag-2-line" aria-hidden="true" />
            <span>Party Portal</span>
          </button>
          <button type="button" onClick={() => navigate("/admin/login")}>
            <i className="ri-shield-user-line" aria-hidden="true" />
            <span>Admin Portal</span>
          </button>
        </div>
      </section>
    </div>
  );
}
