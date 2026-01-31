import { useState } from "react";
import { adminLogin } from "../../services/authService";
import "../styles/auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminLogin(form);
      alert("OTP sent to email");
      localStorage.setItem("adminEmail", form.email);
      window.location.href = "/verify-otp";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2>Admin Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
      </form>
    </div>
  );
}
