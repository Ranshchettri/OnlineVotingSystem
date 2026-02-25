import { useEffect, useMemo, useState } from "react";
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
  const [selectedVoter, setSelectedVoter] = useState(null);
  /* Demo seed data disabled as requested
  const demoVoters = [
    { _id: "demo-1", fullName: "Ram Bahadur Thapa", voterId: "V2847392", email: "ram.thapa@email.com", mobile: "+977-9841234567", district: "Kathmandu", province: "Bagmati", status: "ACTIVE", voted: true, avatar: "https://i.pravatar.cc/100?img=12" },
    { _id: "demo-2", fullName: "Sita Kumari Sharma", voterId: "V2847393", email: "sita.sharma@email.com", mobile: "+977-9851234568", district: "Pokhara", province: "Gandaki", status: "ACTIVE", voted: true, avatar: "https://i.pravatar.cc/100?img=47" },
    { _id: "demo-3", fullName: "Krishna Prasad Adhikari", voterId: "V2847394", email: "krishna.adhikari@email.com", mobile: "+977-9861234569", district: "Lalitpur", province: "Bagmati", status: "PENDING", voted: false, avatar: "https://i.pravatar.cc/100?img=32" },
  ];
  */

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
    photoPreview: "",
    photoData: "",
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
      try {
        const res = await api.get("/voters/admin/stats");
        const data = res.data?.data || {};
        const remoteVoters = data.voters || [];
        setStats(data.stats || computeStatsFromList(remoteVoters));
        setVoters(remoteVoters);
        setError(null);
        return;
      } catch (err) {
        if (err?.response?.status === 404) {
          const res = await api.get("/voters");
          const list =
            res.data?.data?.voters || res.data?.data || res.data || [];
          setVoters(list);
          setStats(computeStatsFromList(list));
          setError(null);
          return;
        }
        if (err.isNetworkError) {
          setVoters([]);
          setStats(computeStatsFromList([]));
          setError("Backend offline: could not load voters.");
          return;
        }
        if (err.isUnauthorized) {
          setError("Unauthorized: please log in as admin.");
          return;
        }
        throw err;
      }
    } catch (err) {
      console.error("Failed to fetch voter data:", err);
      const friendly =
        err.isNetworkError === true
          ? "Backend offline: could not reach voter API."
          : "Failed to load voter data";
      setError(friendly);
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

    if (statusFilter !== "all") {
      filtered = filtered.filter((voter) => voter.status === statusFilter);
    }

    setFilteredVoters(filtered);
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
    try {
      await api.post(`/voters/admin/${voterId}/block`);
      fetchVoterData();
    } catch (err) {
      console.error("Failed to block voter:", err);
      alert("Failed to block voter");
    }
  };

  const handleRejectVoter = async (voterId) => {
    try {
      await api.post(`/voters/admin/${voterId}/reject`);
      fetchVoterData();
    } catch (err) {
      console.error("Failed to reject voter:", err);
      alert("Failed to reject voter");
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files?.[0];
      if (!file) {
        setAddForm((p) => ({ ...p, photo: null, photoPreview: "", photoData: "" }));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAddForm((p) => ({
          ...p,
          photo: file,
          photoPreview: reader.result,
          photoData: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setAddForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleAddVoterSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.fullName || !addForm.email) {
      alert("Name and email are required");
      return;
    }

    try {
      const payload = {
        fullName: addForm.fullName,
        email: addForm.email,
        mobile: addForm.mobile,
        voterId: addForm.voterId,
        voterIdNumber: addForm.voterId,
        photo: addForm.photoData,
      };

      await api.post("/voters/admin", payload);

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
        photoPreview: "",
        photoData: "",
      });
      fetchVoterData();
    } catch (err) {
      console.error("Failed to add voter:", err);
      const msg =
        err.isNetworkError
          ? "Backend unavailable: cannot create voter right now."
          : err.response?.data?.message || "Failed to add voter";
      alert(msg);
    }
  };

  const votedCount = useMemo(
    () => voters.filter((v) => v.hasVoted || v.voted).length,
    [voters],
  );

    const statsCards = useMemo(
      () => {
      const total = Number(stats.totalRegistered || 0);
      const activeRate = total
        ? ((stats.activeVoters / total) * 100).toFixed(1)
        : null;
      const votedRate = total ? ((votedCount / total) * 100).toFixed(1) : null;
      const pendingRate = total
        ? ((stats.inactiveVoters / total) * 100).toFixed(1)
        : null;

      return [
        {
          label: "Active Voters",
          value: Number(stats.activeVoters || 0).toLocaleString(),
          sub: activeRate ? `${activeRate}% of total` : "Awaiting data",
          color: "green",
          icon: "ri-user-3-line",
        },
        {
          label: "Voted",
          value: votedCount.toLocaleString(),
          sub: votedRate ? `${votedRate}% turnout` : "Awaiting data",
          color: "purple",
          icon: "ri-checkbox-circle-line",
        },
        {
          label: "Pending Approval",
          value: Number(stats.inactiveVoters || 0).toLocaleString(),
          sub: pendingRate ? `${pendingRate}% of total` : "Awaiting action",
          color: "orange",
          icon: "ri-time-line",
        },
      ];
    },
    [stats, votedCount],
  );
  const displayVoters = filteredVoters;

  if (loading) {
    return (
      <div className="admin-page voters-page">
        <p>Loading voter data...</p>
      </div>
    );
  }

  return (
    <div className="admin-page voters-page">
      <div className="voters-header">
        <div>
          <div className="admin-section-title">Voter Management</div>
          <div className="admin-section-subtitle">
            Create and manage voter profiles
          </div>
        </div>
        <button className="admin-button primary create-voter-btn" onClick={() => setShowAddModal(true)}>
          <i className="ri-user-add-line" aria-hidden="true" />
          Create Voter
        </button>
      </div>

      <div className="voters-stats">
        {statsCards.map((card) => (
          <div key={card.label} className="voters-stat-card">
            <div className={`stat-icon ${card.color}`}>
              <i className={card.icon} aria-hidden="true" />
            </div>
            <div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="voters-controls">
        <div className="search-box">
          <span className="search-icon" aria-hidden="true">
            <i className="ri-search-line" />
          </span>
          <input
            type="text"
            placeholder="Search voters by name, ID, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      {error && <div className="voters-error">{error}</div>}

      <div className="voters-table-wrapper">
        <table className="voters-table">
          <thead>
            <tr>
              <th>Voter</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Status</th>
              <th>Voted</th>
              <th className="align-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayVoters.length === 0 ? (
              <tr className="voters-empty-row">
                <td colSpan="6">
                  <div className="voters-empty">
                    <span className="empty-icon" aria-hidden="true">
                      <i className="ri-database-2-line" />
                    </span>
                    <div>No voter records to display</div>
                    <div className="muted">Data will appear here after the backend returns voters.</div>
                  </div>
                </td>
              </tr>
            ) : (
              displayVoters.map((voter) => {
                const status = voter.status || "PENDING";
                const voted = voter.hasVoted || voter.voted || false;
                const avatarUrl = voter.avatar || voter.photoUrl || voter.photo;
                const isLocal = voter._local;
                return (
                  <tr key={voter._id || voter.voterId}>
                    <td>
                      <div className="voter-cell">
                        {avatarUrl ? (
                          <img className="voter-avatar photo" src={avatarUrl} alt={voter.fullName} />
                        ) : (
                          <div className="voter-avatar">
                            {voter.fullName?.[0] || "V"}
                          </div>
                        )}
                        <div>
                      <div className="voter-name">{voter.fullName || "—"}</div>
                      <div className="voter-id">{voter.voterId || "—"}</div>
                      {isLocal && <div className="local-chip">Pending sync</div>}
                    </div>
                  </div>
                    </td>
                    <td>
                      <div className="voter-contact">
                        <div>{voter.email || "—"}</div>
                        <div className="muted">{voter.mobile || "—"}</div>
                      </div>
                    </td>
                    <td>
                      <div className="voter-location">
                        <div>{voter.district || "—"}</div>
                        <div className="muted">{voter.province || "—"}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${status.toLowerCase()}`}>
                        {status === "ACTIVE" ? "Active" : status === "PENDING" ? "Pending" : status}
                      </span>
                    </td>
                    <td>
                      <span className={`voted-badge ${voted ? "yes" : "no"}`}>
                        <i
                          className={voted ? "ri-check-line" : "ri-close-line"}
                          aria-hidden="true"
                        />
                      </span>
                    </td>
                    <td className="align-right">
                      <button
                        className="link-btn"
                        onClick={() => setSelectedVoter(voter)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal voters-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Voter Profile</h3>
            <form className="voters-form" onSubmit={handleAddVoterSubmit}>
              <div className="two-col">
                <label>
                  Full Name
                  <input
                    name="fullName"
                    value={addForm.fullName}
                    onChange={handleAddFormChange}
                    placeholder="Enter full name"
                    required
                  />
                </label>
                <label>
                  Date of Birth
                  <input
                    name="dob"
                    value={addForm.dob}
                    onChange={handleAddFormChange}
                    type="date"
                    className="date-input"
                    required
                  />
                </label>
              </div>
              <div className="two-col">
                <label>
                  Email
                  <input
                    name="email"
                    value={addForm.email}
                    onChange={handleAddFormChange}
                    type="email"
                    placeholder="email@example.com"
                    required
                  />
                </label>
                <label>
                  Mobile
                  <input
                    name="mobile"
                    value={addForm.mobile}
                    onChange={handleAddFormChange}
                    type="tel"
                    placeholder="+977-98XXXXXXXX"
                    required
                  />
                </label>
              </div>
              <div className="two-col">
                <label>
                  Voter ID
                  <input
                    name="voterId"
                    value={addForm.voterId}
                    onChange={handleAddFormChange}
                    placeholder="V1234567"
                    required
                  />
                </label>
                <div />
              </div>
              <div className="two-col">
                <label>
                  District
                  <select
                    name="district"
                    value={addForm.district}
                    onChange={handleAddFormChange}
                    required
                  >
                    <option value="">Select District</option>
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Lalitpur">Lalitpur</option>
                  </select>
                </label>
                <label>
                  Province
                  <select
                    name="province"
                    value={addForm.province}
                    onChange={handleAddFormChange}
                    required
                  >
                    <option value="">Select Province</option>
                    <option value="Bagmati">Bagmati</option>
                    <option value="Gandaki">Gandaki</option>
                  </select>
                </label>
              </div>
              <label className="file-drop">
                <input name="photo" type="file" onChange={handleAddFormChange} />
                <span className="file-drop-label">Photo Upload</span>
                <div className="file-drop-box">
                  <span className="file-drop-icon" aria-hidden="true">
                    <i className="ri-upload-cloud-line" />
                  </span>
                  <span>Click to upload or drag and drop</span>
                  <small>PNG, JPG up to 2MB</small>
                </div>
                {addForm.photo && (
                  <div className="upload-preview">
                    <i className="ri-image-line" aria-hidden="true" /> {addForm.photo.name}
                    {addForm.photoPreview ? (
                      <img
                        src={addForm.photoPreview}
                        alt="Preview"
                        className="upload-thumb"
                      />
                    ) : null}
                  </div>
                )}
              </label>
              <div className="admin-modal-actions">
                <button className="admin-button ghost" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="admin-button primary" type="submit">
                  Create Voter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedVoter && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedVoter(null)}>
          <div className="admin-modal voter-details" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const status = selectedVoter.status || "PENDING";
              const voted = selectedVoter.hasVoted || selectedVoter.voted || false;
              return (
                <>
                  <div className="details-header">
                    {(() => {
                      const avatarUrl =
                        selectedVoter.avatar ||
                        selectedVoter.photoUrl ||
                        selectedVoter.photo;
                      return avatarUrl ? (
                        <img
                          className="voter-avatar large photo"
                          src={avatarUrl}
                          alt={selectedVoter.fullName}
                        />
                      ) : (
                        <div className="voter-avatar large">
                          {selectedVoter.fullName?.[0] || "V"}
                        </div>
                      );
                    })()}
                    <div>
                      <div className="details-name">{selectedVoter.fullName}</div>
                      <div className="details-id">
                        Voter ID: {selectedVoter.voterId || "—"}
                      </div>
                      <div className="details-badges">
                        <span className={`status-badge ${status.toLowerCase()}`}>
                          {status === "ACTIVE"
                            ? "Active"
                            : status === "PENDING"
                              ? "Pending"
                              : status}
                        </span>
                        {voted && <span className="status-badge voted">Voted</span>}
                      </div>
                    </div>
                  </div>
                  <div className="details-grid">
                    <div>
                      <div className="stat-label">Email</div>
                      <div className="stat-number">{selectedVoter.email || "—"}</div>
                    </div>
                    <div>
                      <div className="stat-label">Mobile</div>
                      <div className="stat-number">{selectedVoter.mobile || "—"}</div>
                    </div>
                    <div>
                      <div className="stat-label">District</div>
                      <div className="stat-number">
                        {selectedVoter.district || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="stat-label">Province</div>
                      <div className="stat-number">
                        {selectedVoter.province || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="stat-label">Created</div>
                      <div className="stat-number">
                        {selectedVoter.createdAt
                          ? new Date(selectedVoter.createdAt).toLocaleString()
                          : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="admin-modal-actions">
                    {status === "PENDING" ? (
                      <>
                        <button
                          className="admin-button primary"
                          onClick={() => handleApproveVoter(selectedVoter._id)}
                        >
                          Approve Voter
                        </button>
                        <button
                          className="admin-button ghost"
                          onClick={() => handleRejectVoter(selectedVoter._id)}
                        >
                          Reject
                        </button>
                      </>
                    ) : status === "BLOCKED" ? (
                      <button
                        className="admin-button success"
                        onClick={() => handleApproveVoter(selectedVoter._id)}
                      >
                        Unblock Voter
                      </button>
                    ) : (
                      <button
                        className="admin-button primary danger-full"
                        onClick={() => handleBlockVoter(selectedVoter._id)}
                      >
                        Block Voter
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
