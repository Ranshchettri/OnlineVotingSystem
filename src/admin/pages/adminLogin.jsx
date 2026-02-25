import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/gradient-auth.css";

export default function AdminLogin() {
  const nav = useNavigate();
  // Temporarily bypass login: send visitors straight to dashboard
  useEffect(() => {
    localStorage.setItem("token", "admin-demo");
    localStorage.setItem(
      "user",
      JSON.stringify({ role: "admin", email: "demo@admin.local" }),
    );
    nav("/admin/dashboard");
  }, [nav]);

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-visual">
          <h2>Admin control</h2>
          <p>Manage elections, parties, and voters securely.</p>
        </div>
        <div className="auth-form">
          <h1>Admin access</h1>
          <p className="subtitle">Login temporarily disabled — redirecting you to the dashboard preview.</p>
          <div className="auth-status">Auto-redirect…</div>
        </div>
      </div>
    </div>
  );
}
