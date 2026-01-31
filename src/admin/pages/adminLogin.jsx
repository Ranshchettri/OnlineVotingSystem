import { useState } from "react";
import { adminLogin, verifyAdminOtp } from "../services/adminAuthService";
import { decodeToken } from "../../utils/auth";
import "../styles/adminAuth.css";

const AdminLogin = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("ranshsunar@gmail.com");
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

      // If backend says OTP required for admin, go to step 2
      if (res.otpRequired) {
        setAdminId(res.adminId || res.adminId || res.admin || "");
        setStep(2);
        return;
      }

      // If backend returned token directly (no OTP flow), save and redirect
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        } else {
          const decoded = decodeToken(res.token);
          if (decoded) {
            const userFromToken = decoded.user || decoded.payload || decoded || {};
            const id = userFromToken.id || userFromToken._id || userFromToken.sub || decoded.sub;
            const emailFromToken = userFromToken.email || decoded.email || '';
            const role = userFromToken.role || decoded.role || '';
            localStorage.setItem('user', JSON.stringify({ id, email: emailFromToken, role }));
          }
        }
        window.location.href = '/admin/dashboard';
        return;
      }

      setError('Login failed');
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
      // Save token
      localStorage.setItem("token", res.token);

      // Save user if provided by backend, otherwise decode token
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      } else {
        const decoded = decodeToken(res.token);
        if (decoded) {
          // normalize common token payload shapes
          const userFromToken = decoded.user || decoded.payload || decoded || {};

          const id = userFromToken.id || userFromToken._id || userFromToken.sub || decoded.sub;
          const emailFromToken = userFromToken.email || decoded.email || "";
          const role = userFromToken.role || decoded.role || "";

          localStorage.setItem(
            "user",
            JSON.stringify({ id, email: emailFromToken, role })
          );
        }
      }

      // Redirect to dashboard (protected)
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
              onChange={(e) => setEmail(e.target.value)}
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
