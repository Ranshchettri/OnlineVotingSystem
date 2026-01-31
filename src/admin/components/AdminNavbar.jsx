import "../styles/adminNav.css";

export default function AdminNavbar() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin/login";
  };

  return (
    <nav className="admin-nav">
      <div className="admin-nav-brand">OVS Admin</div>
      <button className="admin-logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
