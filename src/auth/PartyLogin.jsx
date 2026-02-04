import { useState } from "react";
import { partyLogin } from "../api/partyApi";
import "../party/styles/party-auth.css";

export default function PartyLogin({ onNext }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await partyLogin(email);
      onNext(email);
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message || "Failed to send OTP. Check your email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="party-auth-container">
      <div className="party-auth-card">
        <div className="auth-header">
          <h1>Party Portal</h1>
          <p>Login to your party account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Official Party Email</label>
            <input
              id="email"
              type="email"
              placeholder="contact@party.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="auth-footer">
          We'll send a one-time password to verify your identity
        </p>
      </div>
    </div>
  );
}
