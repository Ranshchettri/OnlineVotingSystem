import { Outlet } from "react-router-dom";
import PartyHeader from "./PartyHeader";
import PartySidebar from "./PartySidebar";
import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";

export default function PartyLayout() {
  return (
    <div className="party-app">
      <div className="party-shell">
        <PartySidebar />
        <div className="party-main">
          <PartyHeader />
          <main className="party-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
