import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2 className="logo">OVS Admin</h2>

      <nav>
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
        <NavLink to="/admin/voters">Voters</NavLink>
        <NavLink to="/admin/parties">Parties</NavLink>
        <NavLink to="/admin/elections">Elections</NavLink>
        <NavLink to="/admin/results">Results</NavLink>
        <NavLink to="/admin/notifications">Notifications</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
