import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/party-navbar.css";

export default function PartyNavbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const party = JSON.parse(localStorage.getItem("party") || "{}");
  const initials = party.name
    ? party.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "P";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("party");
    window.location.href = "/party/login";
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  return (
    <nav className="party-navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <span className="logo-icon">🏛️</span>
          <span className="logo-text">Party Portal</span>
        </div>
      </div>

      <div className="navbar-center">
        <a href="/party/dashboard" className="nav-link">
          Dashboard
        </a>
        <a href="/party/profile" className="nav-link">
          Profile
        </a>
        <a href="/party/analytics" className="nav-link">
          Analytics
        </a>
        <a href="/party/results" className="nav-link">
          Results
        </a>
      </div>

      <div className="navbar-right">
        <div className="profile-dropdown-wrapper">
          <button
            className="profile-avatar"
            onClick={() => setShowDropdown(!showDropdown)}
            title={party.name}
          >
            {initials}
          </button>

          {showDropdown && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                <strong>{party.name || "Party"}</strong>
                <small>{party.email || "party@example.com"}</small>
              </div>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item"
                onClick={() => handleNavigation("/party/profile")}
              >
                Edit Profile
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
