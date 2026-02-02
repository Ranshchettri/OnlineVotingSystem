import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/partyManagement.css";

export default function ActivePartiesManagement() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statsData, setStatsData] = useState({
    totalParties: 0,
    activeParties: 0,
    pendingRequests: 0,
    suspendedParties: 0,
  });

  useEffect(() => {
    fetchActiveParties();
  }, []);

  const fetchActiveParties = async () => {
    try {
      setLoading(true);
      // Fetch approved/active parties
      const res = await api.get("/parties");
      const allParties =
        res.data?.data?.parties || res.data?.data || res.data || [];
      const activeList = Array.isArray(allParties)
        ? allParties.filter((p) => p.status === "APPROVED" || p.isActive)
        : [];

      setParties(activeList);

      // Calculate stats from the list
      const total = allParties.length;
      const active = activeList.length;
      const pending = Array.isArray(allParties)
        ? allParties.filter((p) => p.status === "PENDING").length
        : 0;
      const suspended = Array.isArray(allParties)
        ? allParties.filter((p) => p.status === "SUSPENDED").length
        : 0;

      setStatsData({
        totalParties: total,
        activeParties: active,
        pendingRequests: pending,
        suspendedParties: suspended,
      });

      setError(null);
    } catch (err) {
      console.error("Failed to fetch active parties:", err);
      setError("Failed to load active parties");
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendParty = async (partyId) => {
    if (window.confirm("Are you sure you want to suspend this party?")) {
      try {
        await api.patch(`/parties/${partyId}`, {
          status: "SUSPENDED",
          isActive: false,
        });
        setSuccessMsg("Party suspended successfully");
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchActiveParties();
      } catch (err) {
        console.error("Failed to suspend party:", err);
        alert(err.response?.data?.message || "Failed to suspend party");
      }
    }
  };

  const handleEditParty = (partyId) => {
    console.log("Edit party:", partyId);
    // TODO: Navigate to party profile/edit page
  };

  const handleViewAnalytics = (partyId) => {
    console.log("View analytics for party:", partyId);
    // TODO: Navigate to party analytics page
  };

  const filteredParties = parties.filter((party) =>
    party.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Stats Cards */}
      <div className="stats-header">
        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-info">
            <h3>Total Parties</h3>
            <div className="stat-number">{statsData.totalParties}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">✅</div>
          <div className="stat-info">
            <h3>Active Parties</h3>
            <div className="stat-number">{statsData.activeParties}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-info">
            <h3>Pending Requests</h3>
            <div className="stat-number">{statsData.pendingRequests}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon suspended">⛔</div>
          <div className="stat-info">
            <h3>Suspended</h3>
            <div className="stat-number">{statsData.suspendedParties}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-filter-group">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by party name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Parties Cards Grid */}
      {loading ? (
        <div className="loading">Loading active parties...</div>
      ) : filteredParties.length === 0 ? (
        <div className="no-data">
          <h3>No active parties</h3>
          <p>Approved parties will appear here</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredParties.map((party) => (
            <div key={party._id} className="party-card-item">
              <div className="party-card-header">
                <div className="party-logo">{party.symbol || "🏛️"}</div>
                <h3>{party.name}</h3>
              </div>

              <div className="party-card-body">
                <div className="party-info-row">
                  <span className="party-info-label">Leader</span>
                  <span className="party-info-value">
                    {party.leaderName || "Not assigned"}
                  </span>
                </div>
                <div className="party-info-row">
                  <span className="party-info-label">Total Votes</span>
                  <span className="party-info-value">
                    {party.totalVotes || 0}
                  </span>
                </div>
                <div className="party-info-row">
                  <span className="party-info-label">Status</span>
                  <span
                    className={`status-badge status-${party.isActive ? "active" : "suspended"}`}
                  >
                    {party.isActive ? "Active" : "Suspended"}
                  </span>
                </div>
              </div>

              <div className="party-card-footer">
                <button
                  className="btn-table-action btn-edit"
                  onClick={() => handleEditParty(party._id)}
                  title="Edit Party Profile"
                >
                  Edit Profile
                </button>
                <button
                  className="btn-table-action btn-view"
                  onClick={() => handleViewAnalytics(party._id)}
                  title="View Analytics"
                >
                  Analytics
                </button>
                {party.isActive && (
                  <button
                    className="btn-table-action btn-suspend"
                    onClick={() => handleSuspendParty(party._id)}
                    title="Suspend Party"
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
