import { Outlet, useNavigate } from "react-router-dom";

export default function PartyLayout() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav("/party/login");
  };

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <h2>🏛️ Party Panel</h2>
        <div className="nav-links">
          <a href="/features/party/pages">Dashboard</a>
          <a href="/features/party/analytics">Analytics</a>
          <a href="/features/party/profile">Profile</a>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
