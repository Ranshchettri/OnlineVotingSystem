import { NavLink } from "react-router-dom";
import emblem from "../../assets/nepal-emblem.svg";

const Sidebar = () => {
  const navItems = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      ),
    },
    {
      label: "Elections",
      to: "/admin/elections",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v4H4z" />
          <path d="M4 10h16v10H4z" />
          <path d="M8 2v4M16 2v4" />
        </svg>
      ),
    },
    {
      label: "Voters",
      to: "/admin/voters",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Parties",
      to: "/admin/parties",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h12l4 4v12H4z" />
          <path d="M8 12h8M8 16h8M8 8h4" />
        </svg>
      ),
    },
    {
      label: "Analytics",
      to: "/admin/analytics",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 3 3 5-6" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <img className="admin-sidebar__logo" src={emblem} alt="Nepal emblem" />
        <div>
          <div className="admin-sidebar__title">OVS Admin</div>
          <div className="admin-sidebar__subtitle">Control Panel</div>
        </div>
      </div>

      <nav className="admin-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? " is-active" : ""}`
            }
          >
            <span className="admin-sidebar__icon">{item.icon}</span>
            <span className="admin-sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__status">
        <div className="admin-sidebar__status-dot" />
        <div>
          <div className="admin-sidebar__status-title">System Status</div>
          <div className="admin-sidebar__status-subtitle">
            All systems operational
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
