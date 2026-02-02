import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/partyManagement.css";

export default function PartyRegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchRegistrationRequests();
  }, []);

  const fetchRegistrationRequests = async () => {
    try {
      setLoading(true);
      // Fetch pending parties - adjust endpoint based on your backend
      const res = await api.get("/parties?status=pending");
      const list = res.data?.data?.parties || res.data?.data || res.data || [];
      setRequests(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch registration requests:", err);
      // Fallback: fetch all and filter client-side
      try {
        const res = await api.get("/parties");
        const list =
          res.data?.data?.parties || res.data?.data || res.data || [];
        const pending = Array.isArray(list)
          ? list.filter((p) => p.status === "PENDING")
          : [];
        setRequests(pending);
      } catch {
        setError("Failed to load registration requests");
        setRequests([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (partyId) => {
    try {
      await api.patch(`/parties/${partyId}`, {
        status: "APPROVED",
        isActive: true,
      });
      setSuccessMsg("Party approved successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchRegistrationRequests();
    } catch (err) {
      console.error("Failed to approve:", err);
      alert(err.response?.data?.message || "Failed to approve party");
    }
  };

  const handleRejectRequest = async (partyId) => {
    if (window.confirm("Are you sure you want to reject this registration?")) {
      try {
        await api.patch(`/parties/${partyId}`, { status: "REJECTED" });
        setSuccessMsg("Party rejected");
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchRegistrationRequests();
      } catch (err) {
        console.error("Failed to reject:", err);
        alert(err.response?.data?.message || "Failed to reject party");
      }
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || (req.status || "PENDING") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Controls */}
      <div className="controls-section">
        <div className="search-filter-group">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by party name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="loading">Loading registration requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="no-data">
          <h3>No registration requests</h3>
          <p>All parties have been processed</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Party Name</th>
                <th>Official Email</th>
                <th>Leader Name</th>
                <th>Requested On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req._id}>
                  <td>
                    <strong>{req.name}</strong>
                  </td>
                  <td>{req.email}</td>
                  <td>{req.leaderName || "-"}</td>
                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`status-badge status-${(req.status || "PENDING").toLowerCase()}`}
                    >
                      {req.status || "PENDING"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {(req.status === "PENDING" || !req.status) && (
                        <>
                          <button
                            className="btn-table-action btn-approve"
                            onClick={() => handleApproveRequest(req._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-table-action btn-reject"
                            onClick={() => handleRejectRequest(req._id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {req.status === "APPROVED" && (
                        <span className="status-badge status-approved">
                          Activated
                        </span>
                      )}
                      {req.status === "REJECTED" && (
                        <span className="status-badge status-rejected">
                          Rejected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
