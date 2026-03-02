import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import "../admin.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-app">
      <div className="admin-shell">
        <Sidebar />
        <div className="admin-main">
          <Topbar />
          <div className="admin-content">{children || <Outlet />}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
