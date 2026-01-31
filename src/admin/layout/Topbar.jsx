import { NavLink } from "react-router-dom";

const Topbar = () => {
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="logo">OVS Admin</div>
        <nav className="top-nav">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/voters">Voters</NavLink>
          <NavLink to="/admin/parties">Parties</NavLink>
          <NavLink to="/admin/elections">Elections</NavLink>
          <NavLink to="/admin/results">Results</NavLink>
          <NavLink to="/admin/notifications">Notifications</NavLink>
        </nav>
      </div>

      <div className="topbar-right">
        {user && <span className="topbar-user">{user.email}</span>}
      </div>
    </header>
  );
};

export default Topbar;
