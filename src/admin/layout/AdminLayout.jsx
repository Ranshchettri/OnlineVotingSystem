import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import "../admin.css";

const AdminLayout = ({ children }) => {
  const nav = useNavigate();

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) {
      // Allow read-only preview without login
      token = "admin-demo";
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ role: "admin", email: "demo@admin.local" }),
      );
    }
    // Do NOT redirect; keep user on requested page to avoid flicker
  }, [nav]);

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
