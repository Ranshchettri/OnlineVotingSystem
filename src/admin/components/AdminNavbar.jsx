import { logout } from "../../hooks/useAuth";
import "../styles/dashboard.css";

export default function AdminNavbar() {
  return (
    <nav className="nav">
      <div className="nav-brand">OVS Admin</div>
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
