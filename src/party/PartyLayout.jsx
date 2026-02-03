import { Outlet } from "react-router-dom";
import PartyNavbar from "../components/PartyNavbar";
import "../styles/party-layout.css";

export default function PartyLayout() {
  return (
    <div className="party-layout">
      <PartyNavbar />
      <div className="party-page-container">
        <Outlet />
      </div>
    </div>
  );
}
