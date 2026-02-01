import { NavLink } from "react-router-dom";
import { useState } from "react";

const Topbar = () => {
  const [open, setOpen] = useState(false);
  const userJson = localStorage.getItem("user");
  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin/login";
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : user?.email
      ? user.email[0].toUpperCase()
      : "A";

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo">OVS Admin</div>
        </div>

        <div className="topbar-right">
          <div className="profile-wrapper">
            <button
              className="profile-btn"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              {initials}
            </button>

            {open && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-name">
                    {user?.fullName || "Admin"}
                  </div>
                  <div className="profile-email">
                    {user?.email || "admin@example.com"}
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="btn-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="secondary-nav">
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
        <NavLink to="/admin/elections/create">Create Election</NavLink>
        <NavLink to="/admin/voters">Voters</NavLink>
        <NavLink to="/admin/parties">Parties</NavLink>
        <NavLink to="/admin/elections">Elections</NavLink>
        <NavLink to="/admin/results">Results</NavLink>
      </nav>
    </>
  );
};

export default Topbar;
