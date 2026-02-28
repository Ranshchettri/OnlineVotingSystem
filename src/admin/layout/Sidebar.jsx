import { NavLink } from "react-router-dom";
import emblem from "../../assets/nepal-emblem.svg";

const Sidebar = () => {
  const navItems = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: "ri-dashboard-line",
    },
    {
      label: "Elections",
      to: "/admin/elections",
      icon: "ri-calendar-event-line",
    },
    {
      label: "Voters",
      to: "/admin/voters",
      icon: "ri-user-3-line",
    },
    {
      label: "Parties",
      to: "/admin/parties",
      icon: "ri-flag-line",
    },
    {
      label: "Analytics",
      to: "/admin/analytics",
      icon: "ri-bar-chart-box-line",
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

      <div className="admin-sidebar__divider" />

      <nav className="admin-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? " is-active" : ""}`
            }
          >
            <span className="admin-sidebar__icon">
              <i className={item.icon} aria-hidden="true" />
            </span>
            <span className="admin-sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__divider bottom" />

      <div className="admin-sidebar__status">
        <span className="admin-sidebar__status-icon">
          <i className="ri-shield-check-line" aria-hidden="true" />
        </span>
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
