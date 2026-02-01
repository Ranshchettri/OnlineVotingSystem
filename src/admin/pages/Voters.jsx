import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/voters.css";

export default function Voters() {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    activeVoters: 0,
    inactiveVoters: 0,
    newRegistered: 0,
    percentageChange: 0,
  });
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [addForm, setAddForm] = useState({
    fullName: "",
    dob: "",
    email: "",
    mobile: "",
    district: "",
    province: "",
    voterId: "",
    idReleaseDate: "",
    photo: null,
  });

  useEffect(() => {
    fetchVoterData();
  }, []);

  useEffect(() => {
    filterVoters();
  }, [voters, searchQuery, statusFilter]);

  const computeStatsFromList = (list = []) => {
    const totalRegistered = list.length;
    const activeVoters = list.filter((v) => v.status === "ACTIVE").length;
    const inactiveVoters = list.filter((v) => v.status === "INACTIVE").length;
    const now = Date.now();
    const thirtyDays = 1000 * 60 * 60 * 24 * 30;
    const newRegistered = list.filter((v) => {
      const created = v.createdAt ? new Date(v.createdAt).getTime() : 0;
      return now - created <= thirtyDays;
    }).length;
    const percentageChange = totalRegistered
      ? (newRegistered / totalRegistered) * 100
      : 0;
    return {
      totalRegistered,
      activeVoters,
      inactiveVoters,
      newRegistered,
      percentageChange,
    };
  };

  const fetchVoterData = async () => {
    try {
      setLoading(true);
      // Try admin stats endpoint first
      try {
        const res = await api.get("/voters/admin/stats");
        const data = res.data?.data || {};
        setStats(data.stats || computeStatsFromList(data.voters || []));
        setVoters(data.voters || []);
        setError(null);
        return;
      } catch (err) {
        // if 404 or not available, fallback to /voters and compute stats client-side
        if (err?.response?.status === 404) {
          const res = await api.get("/voters");
          // backend might return data array or {data: {voters: []}}
          const list =
            res.data?.data?.voters || res.data?.data || res.data || [];
          setVoters(list);
          setStats(computeStatsFromList(list));
          setError(null);
          return;
        }
        throw err;
      }
    } catch (err) {
      console.error("Failed to fetch voter data:", err);
      setError("Failed to load voter data");
      setVoters([]);
      setStats({
        totalRegistered: 0,
        activeVoters: 0,
        inactiveVoters: 0,
        newRegistered: 0,
        percentageChange: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterVoters = () => {
    let filtered = voters;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (voter) =>
          voter.fullName?.toLowerCase().includes(query) ||
          voter.email?.toLowerCase().includes(query) ||
          (voter.voterId || "").toLowerCase().includes(query) ||
          (voter.mobile || "").includes(query),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((voter) => voter.status === statusFilter);
    }

    setFilteredVoters(filtered);
    setCurrentPage(1);
  };

  const handleApproveVoter = async (voterId) => {
    try {
      await api.post(`/voters/admin/${voterId}/approve`);
      fetchVoterData();
    } catch (err) {
      console.error("Failed to approve voter:", err);
      alert("Failed to approve voter");
    }
  };

  const handleBlockVoter = async (voterId) => {
    if (window.confirm("Are you sure you want to block this voter?")) {
      try {
        await api.post(`/voters/admin/${voterId}/block`);
        fetchVoterData();
      } catch (err) {
        console.error("Failed to block voter:", err);
        alert("Failed to block voter");
      }
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setAddForm((p) => ({ ...p, photo: files[0] }));
    } else {
      setAddForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleAddVoterSubmit = async (e) => {
    e.preventDefault();
    // simple validation
    if (!addForm.fullName || !addForm.email) {
      alert("Name and email are required");
      return;
    }

    try {
      const fd = new FormData();
      Object.keys(addForm).forEach((key) => {
        if (addForm[key] !== null && addForm[key] !== undefined) {
          fd.append(key, addForm[key]);
        }
      });

      // Try admin create endpoint, fallback to /voters
      try {
        await api.post("/voters/admin", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        if (err?.response?.status === 404) {
          await api.post("/voters", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          throw err;
        }
      }

      setShowAddModal(false);
      setAddForm({
        fullName: "",
        dob: "",
        email: "",
        mobile: "",
        district: "",
        province: "",
        voterId: "",
        idReleaseDate: "",
        photo: null,
      });
      fetchVoterData();
    } catch (err) {
      console.error("Failed to add voter:", err);
      alert(err.response?.data?.message || "Failed to add voter");
    }
  };

  const paginatedVoters = filteredVoters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredVoters.length / itemsPerPage);

  const StatCard = ({ title, count, percentage, status }) => {
    const isPositive = percentage >= 0;
    const bgColor = {
      registered: "#e0e7ff",
      active: "#dcfce7",
      inactive: "#fef3c7",
      new: "#f3f4f6",
    }[status];

    const textColor = {
      registered: "#3730a3",
      active: "#15803d",
      inactive: "#92400e",
      new: "#4b5563",
    }[status];

    return (
      <div className="stat-card" style={{ backgroundColor: bgColor }}>
        <div className="stat-header">
          <h3>{title}</h3>
          <span
            className={`percentage ${isPositive ? "positive" : "negative"}`}
          >
            {Math.abs(percentage).toFixed(1)}%
          </span>
        </div>
        <div className="stat-count" style={{ color: textColor }}>
          {count}
        </div>
        <p className="stat-subtitle">
          {isPositive ? "Increased" : "Decreased"} this month
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="voters-page">
        <p>Loading voter data...</p>
      </div>
    );
  }

  return (
    <div className="voters-page">
      <div className="page-header">
        <h1>Voter Management</h1>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Registered"
          count={stats.totalRegistered}
          percentage={stats.percentageChange}
          status="registered"
        />
        <StatCard
          title="Active Voters"
          count={stats.activeVoters}
          percentage={
            stats.activeVoters
              ? (stats.activeVoters / (stats.totalRegistered || 1)) * 100
              : 0
          }
          status="active"
        />
        <StatCard
          title="Inactive Voters"
          count={stats.inactiveVoters}
          percentage={
            stats.inactiveVoters
              ? (stats.inactiveVoters / (stats.totalRegistered || 1)) * 100
              : 0
          }
          status="inactive"
        />
        <StatCard
          title="Newly Registered"
          count={stats.newRegistered}
          percentage={stats.percentageChange}
          status="new"
        />
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, email, phone, or voter ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-count">{filteredVoters.length} voters</span>
        </div>

        <div className="filter-section">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending Approval</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <button
            className="btn-add-user"
            onClick={() => setShowAddModal(true)}
          >
            Add Voter
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Voters Table */}
      <div className="table-container">
        {paginatedVoters.length === 0 ? (
          <div className="no-data">
            <p>No voters found</p>
          </div>
        ) : (
          <>
            <table className="voters-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>Voter ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>District</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVoters.map((voter) => (
                  <tr
                    key={voter._id}
                    className={`status-${(voter.status || "").toLowerCase()}`}
                  >
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td className="voter-id">{voter.voterId || "-"}</td>
                    <td className="voter-name">{voter.fullName}</td>
                    <td>{voter.email}</td>
                    <td>{voter.mobile}</td>
                    <td>{voter.district}</td>
                    <td>
                      <span
                        className={`status-badge status-${(voter.status || "").toLowerCase()}`}
                      >
                        {voter.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {voter.status === "PENDING" && (
                        <>
                          <button
                            className="btn-action btn-approve"
                            onClick={() => handleApproveVoter(voter._id)}
                            title="Approve Voter"
                          >
                            Approve
                          </button>
                          <button
                            className="btn-action btn-block"
                            onClick={() => handleBlockVoter(voter._id)}
                            title="Block Voter"
                          >
                            Block
                          </button>
                        </>
                      )}
                      {voter.status === "ACTIVE" && (
                        <button
                          className="btn-action btn-view"
                          title="View Voter Details"
                        >
                          View
                        </button>
                      )}
                      {voter.status === "BLOCKED" && (
                        <button
                          className="btn-action btn-unblock"
                          title="Unblock Voter"
                        >
                          Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className="page-info">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Voter Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Voter</h2>
              <button
                className="btn-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form className="add-voter-form" onSubmit={handleAddVoterSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    name="fullName"
                    value={addForm.fullName}
                    onChange={handleAddFormChange}
                    type="text"
                    placeholder="Enter voter name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    name="dob"
                    value={addForm.dob}
                    onChange={handleAddFormChange}
                    type="date"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    name="email"
                    value={addForm.email}
                    onChange={handleAddFormChange}
                    type="email"
                    placeholder="voter@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile *</label>
                  <input
                    name="mobile"
                    value={addForm.mobile}
                    onChange={handleAddFormChange}
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>District *</label>
                  <input
                    name="district"
                    value={addForm.district}
                    onChange={handleAddFormChange}
                    type="text"
                    placeholder="e.g., Kathmandu"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Province *</label>
                  <input
                    name="province"
                    value={addForm.province}
                    onChange={handleAddFormChange}
                    type="text"
                    placeholder="e.g., Bagmati"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unique Voter ID / PIN</label>
                  <input
                    name="voterId"
                    value={addForm.voterId}
                    onChange={handleAddFormChange}
                    type="text"
                    placeholder="Optional - leave blank to auto-generate"
                  />
                </div>
                <div className="form-group">
                  <label>ID Release Date</label>
                  <input
                    name="idReleaseDate"
                    value={addForm.idReleaseDate}
                    onChange={handleAddFormChange}
                    type="date"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Profile Photo</label>
                <input
                  name="photo"
                  onChange={handleAddFormChange}
                  type="file"
                  accept="image/*"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Add Voter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
