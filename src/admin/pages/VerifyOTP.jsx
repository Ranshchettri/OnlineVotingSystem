import { useState } from "react";
import { verifyAdminOTP } from "../../services/authService";
import { saveToken } from "../../hooks/useAuth";
import "../styles/auth.css";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const email = localStorage.getItem("adminEmail");
      const res = await verifyAdminOTP({ email, otp });
      saveToken(res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2>Verify OTP</h2>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        maxLength="6"
      />
      <button onClick={submit} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>
    </div>
  );
}
