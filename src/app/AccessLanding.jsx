import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const samples = {
  voter: { email: "demo.voter@evote.gov.np", voterId: "NP2025-001" },
  party: { email: "demo.party@evote.gov.np", otp: "246810" },
  admin: { email: "demo.admin@evote.gov.np" },
};

export default function AccessLanding() {
  const nav = useNavigate();

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <section className="auth-hero">
          <div className="auth-badge">
            <i className="ri-shield-check-line" aria-hidden="true" />
            Unified Access
          </div>
          <h1>Choose your portal to continue</h1>
          <p>
            Demo credentials are provided for review. Production builds will use
            real email + OTP plus face approval for voters.
          </p>
          <div className="mini-card">
            <div className="pill green">
              <i className="ri-checkbox-circle-line" aria-hidden="true" />
              Face 2FA active for voters
            </div>
            <p style={{ marginTop: 6, color: "#0f172a" }}>
              Preview date: February 14, 2026 — SMTP is disabled; use demo emails
              below to explore each side.
            </p>
          </div>
        </section>

        <div className="auth-card">
          <header>
            <h2>Pick a side</h2>
            <span className="state-chip info">
              <i className="ri-information-line" aria-hidden="true" />
              Demo-only access
            </span>
          </header>

          <div className="access-cards">
            <div className="access-card">
              <div className="pill green">
                <i className="ri-user-smile-line" aria-hidden="true" />
                Voter
              </div>
              <h3>Face-approved voters</h3>
              <p>
                Uses face verification as the only 2FA step. Email OTP reconnects
                later.
              </p>
              <div className="sample-chip">
                <i className="ri-mail-line" aria-hidden="true" />
                {samples.voter.email} / {samples.voter.voterId}
              </div>
              <button
                className="btn-primary"
                onClick={() => nav("/voter/login")}
              >
                Open Voter Login
              </button>
            </div>

            <div className="access-card">
              <div className="pill blue">
                <i className="ri-team-line" aria-hidden="true" />
                Party
              </div>
              <h3>Party committee</h3>
              <p>Preview OTP login flow. Mail delivery will be enabled later.</p>
              <div className="sample-chip">
                <i className="ri-mail-line" aria-hidden="true" />
                {samples.party.email} (OTP: {samples.party.otp})
              </div>
              <button
                className="btn-secondary"
                onClick={() => nav("/party/login")}
              >
                Open Party Login
              </button>
            </div>

            <div className="access-card">
              <div className="pill red">
                <i className="ri-shield-user-line" aria-hidden="true" />
                Admin
              </div>
              <h3>Admin console</h3>
              <p>2FA temporarily bypassed so you can audit the UI.</p>
              <div className="sample-chip">
                <i className="ri-mail-line" aria-hidden="true" />
                {samples.admin.email}
              </div>
              <button
                className="btn-ghost"
                onClick={() => nav("/admin/login")}
              >
                Open Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
