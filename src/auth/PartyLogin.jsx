import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/gradient-auth.css";

export default function PartyLogin() {
  const nav = useNavigate();
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("54321");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await api.post("/auth/party-login", { email: normalizedEmail });
      setEmail(normalizedEmail);
      setOtp(res.data?.otp || "54321");
      setStatus("Demo OTP generated (no email).");
      setStep("otp");
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await api.post("/auth/party/verify-otp", {
        email: email.trim().toLowerCase(),
        otp,
      });
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("party", JSON.stringify(res.data.user));
      nav("/party/home");
    } catch (err) {
      setStatus(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-visual">
          <h2>Party workspace</h2>
          <p>Access party dashboards, requests, and analytics.</p>
        </div>
        <form className="auth-form" onSubmit={step === "login" ? sendOtp : verifyOtp}>
          <h1>Party sign in</h1>
          <p className="subtitle">Enter official party email, then confirm with demo OTP 54321.</p>
          {status && <div className="preview-chip">{status}</div>}

          {step === "login" && (
            <>
              <div className="auth-field">
                <label>Party email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Get OTP"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="auth-field">
                <label>OTP (demo)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <div className="auth-status">Demo OTP: {otp || "54321"}</div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Enter"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
