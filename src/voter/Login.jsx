import { useState } from "react";
import { voterLogin } from "../api/voterApi";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ identifier: "", voterId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async () => {
    if (!form.identifier || !form.voterId) {
      setError("All fields required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await voterLogin(form);
      nav("/voter/otp");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voter-auth-container">
      <div className="auth-card">
        <h2>Voter Login</h2>
        <p className="subtitle">Enter your credentials to vote</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>Email or Phone</label>
          <input
            type="text"
            placeholder="email@example.com or 9812345678"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Voter ID</label>
          <input
            type="text"
            placeholder="Your Voter ID"
            value={form.voterId}
            onChange={(e) => setForm({ ...form, voterId: e.target.value })}
          />
        </div>

        <button onClick={submit} disabled={loading} className="btn btn-primary">
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
}
