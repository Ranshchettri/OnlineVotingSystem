import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import "../admin.css";

const isAdminToken = (token) => {
  if (!token) return false;
  if (token === "admin-demo") return true;
  try {
    const payloadRaw = token.split(".")[1];
    if (!payloadRaw) return false;
    const payload = JSON.parse(atob(payloadRaw));
    return String(payload?.role || "").toLowerCase() === "admin";
  } catch {
    return false;
  }
};

const AdminLayout = ({ children }) => {
  const nav = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    if (user && user.role === "admin") {
      if (!isAdminToken(token)) {
        localStorage.setItem("token", "admin-demo");
      }
    } else if (!user) {
      // No user, set demo mode
      localStorage.setItem("token", "admin-demo");
      localStorage.setItem(
        "user",
        JSON.stringify({ role: "admin", email: "demo@admin.local" }),
      );
    } else {
      // User exists but not admin, redirect
      nav("/");
      return;
    }
    setAuthorized(true);
  }, [nav]);

  if (!authorized) {
    return null; // Prevent rendering until authorized
  }

  return (
    <div className="admin-app">
      <div className="admin-shell">
        <Sidebar />
        <div className="admin-main">
          <Topbar />
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
