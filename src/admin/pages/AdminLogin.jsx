import { useState } from "react";
import { loginAdmin, verifyAdminOtp } from "../../services/authService";
import "../../styles/theme.css";
import "../styles/adminLogin.css";

export default function AdminLogin() {
  const [step, setStep] = useState(1); // Step 1: Email/Pass, Step 2: OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [adminId, setAdminId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // STEP 1: Email + Password
  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginAdmin(email, password);

      if (response.otpRequired) {
        // OTP sent to email
        setAdminId(response.adminId);
        setStep(2); // Move to OTP step
        setError(""); // Clear error
      } else {
        // Direct login (voter or other role)
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Check credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: OTP Verify
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await verifyAdminOtp(adminId, otp);

      if (response.token) {
        // Login successful
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {step === 1 ? (
          // STEP 1: Email + Password
          <>
            <div className="admin-login-header">
              <h2>🔐 Admin Login</h2>
              <p>Secure access to election control panel</p>
            </div>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleEmailPasswordSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="ranshsunar@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? "Verifying..." : "Next"}
              </button>
            </form>
          </>
        ) : (
          // STEP 2: OTP Verify
          <>
            <div className="admin-login-header">
              <h2>✉️ Verify OTP</h2>
              <p>Enter the 6-digit code sent to your email</p>
            </div>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <label>One-Time Password</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  maxLength="6"
                  required
                  disabled={loading}
                  className="otp-input"
                />
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                }}
                disabled={loading}
                className="back-btn"
              >
                ← Back
              </button>
            </form>

            <p className="otp-info">
              💡 Check your email for the OTP. It expires in 5 minutes.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
