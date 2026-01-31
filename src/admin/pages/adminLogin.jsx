import { useState } from "react";
import { adminLogin, verifyAdminOtp } from "../services/adminAuthService";
import "../styles/adminAuth.css";

const AdminLogin = () => {
  const [step, setStep] = useState(1);
  const [email] = useState("ranshsunar@gmail.com");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [adminId, setAdminId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminLogin(email, password);

      if (res.otpRequired) {
        setAdminId(res.adminId);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await verifyAdminOtp(adminId, otp);
      localStorage.setItem("token", res.token);
      window.location.href = "/admin/dashboard";
    } catch {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <h2>Admin Secure Login</h2>

        <div className="step-indicator">Step {step} of 2</div>

        {error && <p className="error-text">{error}</p>}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              disabled
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Sending OTP..." : "Login"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="otp-info">
              OTP has been sent to your email. Check your inbox.
            </p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              maxLength="6"
              autoFocus
            />
            <button onClick={handleOtpVerify} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
