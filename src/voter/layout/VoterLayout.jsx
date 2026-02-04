import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";

export default function VoterLayout() {
  const location = useLocation();
  const isPartyProfile = location.pathname.startsWith("/voter/party/");

  if (isPartyProfile) {
    return (
      <div className="voter-app">
        <div className="voter-main">
          <main className="voter-content">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="voter-app">
      <div className="voter-shell">
        <Sidebar />
        <div className="voter-main">
          <Topbar />
          <main className="voter-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
