import { NavLink } from "react-router-dom";

const Topbar = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin/login";
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo">OVS Admin</div>
        </div>

        <div className="topbar-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="secondary-nav">
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
        <NavLink to="/admin/voters">Voters</NavLink>
        <NavLink to="/admin/parties">Parties</NavLink>
        <NavLink to="/admin/elections">Elections</NavLink>
        <NavLink to="/admin/results">Results</NavLink>
        <NavLink to="/admin/notifications">Notifications</NavLink>
      </nav>
    </>
  );
};

export default Topbar;
