import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import "../admin.css";

const AdminLayout = ({ children }) => {
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/admin/login", { replace: true });
    }
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
