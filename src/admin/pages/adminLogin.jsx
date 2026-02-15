import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import "../styles/adminAuth.css";

const demoAdmin = {
  email: "demo.admin@evote.gov.np",
  note: "2FA disabled for UI review only",
};

export default function AdminLogin() {
  const nav = useNavigate();

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <section className="auth-hero">
          <div className="auth-badge">
            <i className="ri-shield-user-line" aria-hidden="true" />
            Admin Control Room
          </div>
          <h1>Review the admin console without production 2FA</h1>
          <p>
            We temporarily bypass email/OTP so you can inspect dashboards
            quickly. Security hardening will be enabled once SMTP is connected.
          </p>
          <div className="mini-card">
            <div className="pill red">
              <i className="ri-error-warning-line" aria-hidden="true" />
              Preview only
            </div>
            <p style={{ marginTop: 8 }}>Demo admin email: {demoAdmin.email}</p>
            <p style={{ marginTop: 4, color: "#334155" }}>{demoAdmin.note}</p>
          </div>
        </section>

        <div className="auth-card">
          <header>
            <h2>Admin Login (Preview)</h2>
            <span className="state-chip warn">
              <i className="ri-shield-keyhole-line" aria-hidden="true" />
              2FA off
            </span>
          </header>

          <p className="auth-subtitle">
            Click continue to open the admin dashboard. Use the demo email above
            as reference; production build will require verified credentials.
          </p>

          <div className="form-stack">
            <div className="input-label">Preview Account</div>
            <div className="sample-chip">
              <i className="ri-mail-line" aria-hidden="true" />
              {demoAdmin.email}
            </div>

            <div className="auth-actions">
              <button
                className="btn-primary"
                onClick={() => nav("/admin/dashboard")}
              >
                Enter Admin Dashboard
                <i className="ri-arrow-right-line" aria-hidden="true" />
              </button>
              <button
                className="btn-ghost"
                onClick={() => nav("/")}
                type="button"
              >
                Back to Access Hub
              </button>
            </div>

            <div className="mini-card">
              <strong>Next step:</strong>{" "}
              reconnect email OTP + device binding once mail service is live.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
