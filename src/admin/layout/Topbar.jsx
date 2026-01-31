import { NavLink } from "react-router-dom";

const Topbar = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Top navbar - white with logo, search, logout */}
      <header className="topbar-top">
        <div className="topbar-top-left">
          <div className="logo">OVS Admin</div>
        </div>

        <div className="topbar-top-middle">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        <div className="topbar-top-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Bottom navbar - blue with nav links */}
      <nav className="topbar-bottom">
        <div className="nav-links">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/voters">Voters</NavLink>
          <NavLink to="/admin/parties">Parties</NavLink>
          <NavLink to="/admin/elections">Elections</NavLink>
          <NavLink to="/admin/results">Results</NavLink>
          <NavLink to="/admin/notifications">Notifications</NavLink>
        </div>
      </nav>
    </>
  );
};

export default Topbar;
