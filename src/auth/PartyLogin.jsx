import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { partyLogin, verifyPartyOTP } from "../api/partyApi";
import "../party/styles/party-auth.css";

const demoParty = {
  email: "demo.party@evote.gov.np",
  otp: "246810",
};

export default function PartyLogin() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(demoParty.email);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    "SMTP is disabled in this preview. Use the demo email to jump into the party dashboard.",
  );
  const nav = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Official party email is required.");
      return;
    }
    setError("");
    setLoading(true);
    const isDemo = email.toLowerCase() === demoParty.email;

    if (isDemo) {
      setInfo("Demo email detected. OTP prefilled below.");
      setOtp(demoParty.otp);
      setStep("otp");
      setLoading(false);
      return;
    }

    try {
      await partyLogin(email);
      setInfo("OTP sent to your official party inbox.");
      setStep("otp");
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message || "Failed to send OTP. Check your email.",
      );
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Enter the OTP sent to your inbox.");
      return;
    }
    setError("");
    setLoading(true);
    const isDemo = email.toLowerCase() === demoParty.email;

    if (isDemo) {
      localStorage.setItem(
        "party-demo",
        JSON.stringify({ email, otp, verified: true }),
      );
      nav("/party/home");
      setLoading(false);
      return;
    }

    try {
      const res = await verifyPartyOTP({ email, otp });
      localStorage.setItem("token", res.data?.token || res.data?.data?.token);
      const user = res.data?.user || res.data?.data?.user;
      if (user) localStorage.setItem("party", JSON.stringify(user));
      nav("/party/home");
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("email");
    setOtp("");
    setError("");
    setInfo(
      "SMTP is disabled in this preview. Use the demo email to jump into the party dashboard.",
    );
  };

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <section className="auth-hero party-accent">
          <div className="auth-badge">
            <i className="ri-team-line" aria-hidden="true" />
            Party Committee Access
          </div>
          <h1>Coordinate and monitor your party workspace</h1>
          <p>Use the demo email to preview. Real OTP mail will follow.</p>
          <div className="mini-card">
            <div className="pill blue">
              <i className="ri-mail-line" aria-hidden="true" />
              Demo Email
            </div>
            <p style={{ marginTop: 8 }}>
              {demoParty.email} (OTP: {demoParty.otp})
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <span className="pill red">
                <i className="ri-error-warning-line" aria-hidden="true" />
                Live mail off
              </span>
              <span className="pill green">
                <i className="ri-shield-check-line" aria-hidden="true" />
                OTP secured
              </span>
            </div>
          </div>
        </section>

        <div className="auth-card">
          <header>
            <div className="stepper">
              <span className={`step-pill ${step === "email" ? "active" : ""}`}>
                1
              </span>
              <div className="step-divider" />
              <span className={`step-pill ${step === "otp" ? "active" : ""}`}>
                2
              </span>
            </div>
            <span className="state-chip info">
              <i className="ri-shield-keyhole-line" aria-hidden="true" />
              Email + OTP
            </span>
          </header>

          <p className="auth-subtitle">{info}</p>
          {error && (
            <div className="alert-soft">
              <i className="ri-error-warning-line" aria-hidden="true" />
              {error}
            </div>
          )}

          {step === "email" && (
            <form className="form-stack" onSubmit={sendOtp}>
              <div>
                <div className="input-label">Official Party Email</div>
                <input
                  className="input-field"
                  type="email"
                  placeholder="contact@party.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <p className="input-hint">
                  For now, the demo email is prefilled for quick review.
                </p>
              </div>

              <div className="auth-actions">
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                  <i className="ri-arrow-right-line" aria-hidden="true" />
                </button>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form className="form-stack" onSubmit={verify}>
              <div>
                <div className="input-label">One-Time Password</div>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  disabled={loading}
                />
                <p className="input-hint">
                  OTP was sent to {email}. Demo OTP is already filled.
                </p>
              </div>

              <div className="auth-actions">
                <button className="btn-secondary" type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Enter"}
                  <i className="ri-check-line" aria-hidden="true" />
                </button>
                <button className="btn-ghost" type="button" onClick={reset}>
                  <i className="ri-arrow-left-line" aria-hidden="true" />
                  Edit email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
