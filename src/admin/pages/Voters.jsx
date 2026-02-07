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
  const demoVoters = [
    {
      _id: "demo-1",
      fullName: "Ram Bahadur Thapa",
      voterId: "V2847392",
      email: "ram.thapa@email.com",
      mobile: "+977-9841234567",
      district: "Kathmandu",
      province: "Bagmati",
      status: "ACTIVE",
      voted: true,
      avatar: "https://i.pravatar.cc/100?img=12",
    },
    {
      _id: "demo-2",
      fullName: "Sita Kumari Sharma",
      voterId: "V2847393",
      email: "sita.sharma@email.com",
      mobile: "+977-9851234568",
      district: "Pokhara",
      province: "Gandaki",
      status: "ACTIVE",
      voted: true,
      avatar: "https://i.pravatar.cc/100?img=47",
    },
    {
      _id: "demo-3",
      fullName: "Krishna Prasad Adhikari",
      voterId: "V2847394",
      email: "krishna.adhikari@email.com",
      mobile: "+977-9861234569",
      district: "Lalitpur",
      province: "Bagmati",
      status: "PENDING",
      voted: false,
      avatar: "https://i.pravatar.cc/100?img=32",
    },
  ];

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
      try {
        const res = await api.get("/voters/admin/stats");
        const data = res.data?.data || {};
        setStats(data.stats || computeStatsFromList(data.voters || []));
        setVoters(data.voters || []);
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
      setAddForm((p) => ({ ...p, photo: files[0] }));
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
      const fd = new FormData();
      Object.keys(addForm).forEach((key) => {
        if (addForm[key] !== null && addForm[key] !== undefined) {
          fd.append(key, addForm[key]);
        }
      });

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

  const statsCards = useMemo(
    () => [
      {
        label: "Active Voters",
        value: stats.activeVoters.toLocaleString(),
        sub: "93.2% of total",
        color: "green",
        icon: "ri-user-3-line",
      },
      {
        label: "Voted",
        value: `${
          stats.totalRegistered
            ? ((stats.activeVoters / stats.totalRegistered) * 100).toFixed(1)
            : 68.4
        }%`,
        sub: "1,947,283 voters",
        color: "purple",
        icon: "ri-checkbox-circle-line",
      },
      {
        label: "Pending Approval",
        value: stats.inactiveVoters || 156,
        sub: "Requires action",
        color: "orange",
        icon: "ri-time-line",
      },
    ],
    [stats],
  );
  const displayVoters = useMemo(
    () => (filteredVoters.length ? filteredVoters : demoVoters),
    [filteredVoters],
  );

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
            {displayVoters.map((voter) => {
              const status = voter.status || "PENDING";
              const voted = voter.hasVoted || voter.voted || false;
              const avatarUrl = voter.avatar || voter.photoUrl || voter.photo;
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
                        <div className="voter-name">{voter.fullName}</div>
                        <div className="voter-id">{voter.voterId || "V2847392"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="voter-contact">
                      <div>{voter.email}</div>
                      <div className="muted">{voter.mobile}</div>
                    </div>
                  </td>
                  <td>
                    <div className="voter-location">
                      <div>{voter.district || "Kathmandu"}</div>
                      <div className="muted">{voter.province || "Bagmati"}</div>
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
            })}
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
                        Voter ID: {selectedVoter.voterId || "V2847393"}
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
                      <div className="stat-number">{selectedVoter.email}</div>
                    </div>
                    <div>
                      <div className="stat-label">Mobile</div>
                      <div className="stat-number">{selectedVoter.mobile}</div>
                    </div>
                    <div>
                      <div className="stat-label">District</div>
                      <div className="stat-number">
                        {selectedVoter.district || "Pokhara"}
                      </div>
                    </div>
                    <div>
                      <div className="stat-label">Province</div>
                      <div className="stat-number">
                        {selectedVoter.province || "Gandaki"}
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
