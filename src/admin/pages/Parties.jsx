import { useState } from "react";
import PartyRegistrationRequests from "./PartyRegistrationRequests";
import ActivePartiesManagement from "./ActivePartiesManagement";
import "../styles/partyManagement.css";

export default function Parties() {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <div className="parties-section">
      {/* Tabs Navigation */}
      <div className="parties-tabs">
        <button
          className={`tab-button ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Registration Requests
        </button>
        <button
          className={`tab-button ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Parties
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "requests" && <PartyRegistrationRequests />}
        {activeTab === "active" && <ActivePartiesManagement />}
      </div>
    </div>
  );
}
