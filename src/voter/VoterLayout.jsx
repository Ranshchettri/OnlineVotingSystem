import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function VoterLayout() {
  const nav = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const logout = () => {
    localStorage.clear();
    nav("/voter/login");
  };

  return (
    <>
      <div className="voter-navbar">
        <div className="navbar-left">
          <h3>OVS Voter</h3>
        </div>
        <div className="navbar-right">
          <div className="profile-wrapper">
            <button
              className="profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              👤
            </button>
            {showDropdown && (
              <div className="profile-dropdown">
                <button onClick={() => nav("/voter/profile")}>Profile</button>
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-container">
        <Outlet />
      </div>
    </>
  );
}
