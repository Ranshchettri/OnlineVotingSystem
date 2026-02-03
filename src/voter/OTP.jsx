import { useState } from "react";
import { verifyVoterOTP } from "../api/voterApi";
import { useNavigate } from "react-router-dom";

export default function OTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const verify = async () => {
    if (!otp || otp.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await verifyVoterOTP({ otp });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("voter", JSON.stringify(res.data.voter));
      nav("/voter/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voter-auth-container">
      <div className="auth-card">
        <h2>Verify OTP</h2>
        <p className="subtitle">
          Enter the 6-digit code sent to your email/phone
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>OTP Code</label>
          <input
            type="text"
            maxLength="6"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="otp-input"
          />
        </div>

        <button onClick={verify} disabled={loading} className="btn btn-primary">
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
}
