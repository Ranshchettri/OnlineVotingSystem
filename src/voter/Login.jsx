import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/gradient-auth.css";
import FaceVerifyModal from "./components/FaceVerifyModal";

export default function VoterLogin() {
  const nav = useNavigate();
  const [step, setStep] = useState("login");
  const [form, setForm] = useState({ email: "", voterId: "" });
  const [otp, setOtp] = useState("123456");
  const [voterDbId, setVoterDbId] = useState(null);
  const [faceVerified, setFaceVerified] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const startLogin = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const res = await api.post("/auth/voter/login", {
        email: form.email,
        voterId: form.voterId,
      });
      setOtp(res.data?.otp || "123456");
      setVoterDbId(res.data?.voterId);
      setStep("face");
      setStatus("Face verification is demo-only. Then enter OTP 123456.");
    } catch (err) {
      setStatus(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!voterDbId) return;
    if (!faceVerified) {
      setStatus("Complete face verification first.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const res = await api.post("/auth/voter/verify-otp", {
        voterId: voterDbId,
        otp,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("voter", JSON.stringify(res.data.user));
      nav("/voter/dashboard");
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
          <h2>Vote securely</h2>
          <p>Face check + OTP keeps your ballot protected.</p>
        </div>

        <form className="auth-form" onSubmit={step === "login" ? startLogin : verifyOtp}>
          <h1>Voter sign in</h1>
          <p className="subtitle">Enter your registered email and Voter ID.</p>
          {status && <div className="preview-chip">{status}</div>}

          {step === "login" && (
            <>
              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Voter ID</label>
                <input
                  type="text"
                  value={form.voterId}
                  onChange={(e) => setForm({ ...form, voterId: e.target.value })}
                  required
                />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Checking..." : "Continue"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="auth-field">
                <label>OTP (demo 123456)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <div className="auth-status">Face verified ✓ | Demo OTP: {otp}</div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Enter"}
              </button>
            </>
          )}
        </form>
      </div>

      <FaceVerifyModal
        isOpen={step === "face"}
        party={null}
        onClose={() => setStep("login")}
        onVerified={() => {
          setFaceVerified(true);
          setStep("otp");
        }}
      />
    </div>
  );
}
