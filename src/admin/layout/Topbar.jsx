const Topbar = () => {
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin/login";
  };

  return (
    <header className="topbar">
      <div className="topbar-left">Admin Panel</div>
      <div className="topbar-right">
        {user && <span className="topbar-user">{user.email}</span>}
        <button className="topbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
