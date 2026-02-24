import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/gradient-auth.css";

export default function AdminLogin() {
  const nav = useNavigate();
  const [step, setStep] = useState("login");
  const [form, setForm] = useState({ email: "ranshsunar@gmail.com", password: "Admin@123456" });
  const [otp, setOtp] = useState("999999");
  const [adminId, setAdminId] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await api.post("/auth/login", form);
      if (res.data?.otpRequired) {
        setAdminId(res.data.adminId);
        setOtp(res.data.otp || "999999");
        setStatus("Demo OTP generated. Enter it below.");
        setStep("otp");
      } else if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        nav("/admin/dashboard");
      }
    } catch (err) {
      setStatus(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    if (!adminId) return;
    setLoading(true);
    setStatus("");
    try {
      const res = await api.post("/auth/admin/verify-otp", { adminId, otp });
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      nav("/admin/dashboard");
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
          <h2>Admin control</h2>
          <p>Manage elections, parties, and voters securely.</p>
        </div>
        <form className="auth-form" onSubmit={step === "login" ? submitLogin : submitOtp}>
          <h1>Admin sign in</h1>
          <p className="subtitle">Use your admin email and password. OTP is demo-only (no email sent).</p>
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
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Please wait..." : "Get Started"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="auth-field">
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <div className="auth-status">Demo OTP: {otp || "999999"}</div>
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
