import { Outlet, useNavigate } from "react-router-dom";

export default function VoterLayout() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav("/voter/login");
  };

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <h2> Voter Portal</h2>
        <div className="nav-links">
          <a href="/features/voter/pages">Home</a>
          <a href="/features/voter/vote">Vote</a>
          <a href="/features/voter/results">Results</a>
          <a href="/features/voter/history">History</a>
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
