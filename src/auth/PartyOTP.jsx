import { useState } from "react";
import { verifyPartyOTP } from "../api/partyApi";
import "../styles/party-auth.css";

export default function PartyOTP({ email, onBack }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await verifyPartyOTP({ email, otp });
      localStorage.setItem("token", res.data?.token || res.data?.data?.token);
      const user = res.data?.user || res.data?.data?.user;
      if (user) {
        localStorage.setItem("party", JSON.stringify(user));
      }
      window.location.href = "/party/dashboard";
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="party-auth-container">
      <div className="party-auth-card">
        <div className="auth-header">
          <h1>Verify OTP</h1>
          <p>We sent a code to {email}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleVerify} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp">One-Time Password</label>
            <input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength="6"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button onClick={onBack} className="btn-back">
          Back to Email
        </button>
      </div>
    </div>
  );
}
