import { Navigate } from "react-router-dom";
import Topbar from "./Topbar";
import "../admin.css";
import { getToken, decodeToken } from "../../utils/auth";

const AdminLayout = ({ children }) => {
  // dev override: if localStorage.admin_override === 'true', allow access
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("admin_override") === "true"
  ) {
    return (
      <div className="admin-root">
        <div className="admin-main">
          <Topbar />
          <div className="admin-content">{children}</div>
        </div>
      </div>
    );
  }

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;
  const token = typeof window !== "undefined" ? getToken() : null;

  // allow if user exists and role is ADMIN (case-insensitive)
  const hasAdminRole =
    user && user.role && String(user.role).toUpperCase() === "ADMIN";

  // if user not present but token exists, try decode token and check role
  let tokenIsAdmin = false;
  if (!hasAdminRole && token) {
    const decoded = decodeToken(token);
    if (decoded) {
      const role = decoded.role || decoded.roles || decoded.user?.role;
      if (Array.isArray(role)) {
        tokenIsAdmin = role
          .map((r) => String(r).toUpperCase())
          .includes("ADMIN");
      } else if (role) {
        tokenIsAdmin = String(role).toUpperCase() === "ADMIN";
      }
    }
  }

  const isAdmin = hasAdminRole || tokenIsAdmin || false;

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-root">
      <div className="admin-main">
        <Topbar />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
