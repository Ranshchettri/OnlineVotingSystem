import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import "../admin.css";

const AdminLayout = ({ children }) => {
  const nav = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.role === "admin") {
      // Already admin, allow
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
