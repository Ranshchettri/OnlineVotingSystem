import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../styles/voters.css";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

const normalizeVoterStatus = (voter = {}) => {
  const raw = String(voter.status || voter.verificationStatus || "").toLowerCase();
  if (raw === "blocked" || raw === "inactive" || raw === "rejected") return "BLOCKED";
  if (raw === "active" || raw === "approved" || raw === "auto-approved") return "ACTIVE";
  if (voter.isVerified || voter.verified) return "ACTIVE";
  return "PENDING";
};

const statusLabel = (status) => {
  if (status === "ACTIVE") return "Active";
  if (status === "BLOCKED") return "Blocked";
  return "Pending";
};

const deriveDistrictProvince = (voter = {}) => {
  const directDistrict = (voter.district || "").trim();
  const directProvince = (voter.province || "").trim();
  if (directDistrict || directProvince) {
    return {
      district: directDistrict,
      province: directProvince,
    };
  }

  const addressText = String(voter.address || "").trim();
  if (!addressText) {
    return { district: "", province: "" };
  }

  const parts = addressText
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    district: parts[0] || "",
    province: parts[1] || "",
  };
};

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
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    voterId: "",
    district: "",
    province: "",
    dateOfBirth: "",
    photoData: "",
  });
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

  const computeStatsFromList = (list = []) => {
    const totalRegistered = list.length;
    const activeVoters = list.filter((v) => normalizeVoterStatus(v) === "ACTIVE").length;
    const inactiveVoters = list.filter((v) => normalizeVoterStatus(v) !== "ACTIVE").length;
    const now = Date.now();
    const thirtyDays = 1000 * 60 * 60 * 24 * 30;
    const newRegistered = list.filter((v) => {
      const created = v.createdAt ? new Date(v.createdAt).getTime() : 0;
      return now - created <= thirtyDays;
    }).length;
    const percentageChange = totalRegistered ? (newRegistered / totalRegistered) * 100 : 0;
    return {
      totalRegistered,
      activeVoters,
      inactiveVoters,
      newRegistered,
      percentageChange,
    };
  };

  const normalizeList = (list = []) =>
    (Array.isArray(list) ? list : []).map((voter) => {
      const location = deriveDistrictProvince(voter);
      return {
        ...voter,
        status: normalizeVoterStatus(voter),
        district: location.district,
        province: location.province,
        address: voter.address || "",
        dateOfBirth: voter.dateOfBirth || voter.dob || null,
        updatedAt: voter.updatedAt || null,
      };
    });

  const fetchVoterData = async () => {
    try {
      setLoading(true);
      try {
        const res = await api.get("/voters/admin/stats");
        const data = res.data?.data || {};
        const remoteVoters = normalizeList(data.voters || []);
        setStats(data.stats || computeStatsFromList(remoteVoters));
        setVoters(remoteVoters);
        setError(null);
        return;
      } catch (err) {
        if (err?.response?.status === 404) {
          const res = await api.get("/voters");
          const list = res.data?.data?.voters || res.data?.data || res.data || [];
          const mapped = normalizeList(list);
          setVoters(mapped);
          setStats(computeStatsFromList(mapped));
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

  useEffect(() => {
    fetchVoterData();
  }, []);

  const applyVoterPatch = (voterId, patch) => {
    const applyPatch = (voter) => {
      const merged = { ...voter, ...patch };
      return { ...merged, status: normalizeVoterStatus(merged) };
    };

    setVoters((prev) => prev.map((voter) => (voter._id === voterId ? applyPatch(voter) : voter)));
    setSelectedVoter((prev) => (prev && prev._id === voterId ? applyPatch(prev) : prev));
  };

  useEffect(() => {
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
      if (statusFilter === "INACTIVE") {
        filtered = filtered.filter((voter) => normalizeVoterStatus(voter) !== "ACTIVE");
      } else {
        filtered = filtered.filter((voter) => normalizeVoterStatus(voter) === statusFilter);
      }
    }

    setFilteredVoters(filtered);
  }, [voters, searchQuery, statusFilter]);

  const openVoterDetails = (voter) => {
    const location = deriveDistrictProvince(voter);
    setSelectedVoter(voter);
    setEditMode(false);
    setEditForm({
      fullName: voter.fullName || "",
      email: voter.email || "",
      mobile: voter.mobile || "",
      voterId: voter.voterId || "",
      district: location.district,
      province: location.province,
      dateOfBirth: voter.dateOfBirth
        ? new Date(voter.dateOfBirth).toISOString().split("T")[0]
        : "",
      photoData: voter.photoUrl || voter.photo || voter.avatar || "",
    });
  };

  const closeVoterDetails = () => {
    setSelectedVoter(null);
    setEditMode(false);
  };

  const handleApproveVoter = async (voterId) => {
    if (!voterId) return;
    try {
      await api.post(`/voters/admin/${voterId}/approve`);
      applyVoterPatch(voterId, {
        verificationStatus: "auto-approved",
        isVerified: true,
        verified: true,
      });
      setEditMode(false);
      await fetchVoterData();
    } catch (err) {
      console.error("Failed to approve voter:", err);
      alert("Failed to approve voter");
    }
  };

  const handleBlockVoter = async (voterId) => {
    if (!voterId) return;
    try {
      await api.post(`/voters/admin/${voterId}/block`);
      applyVoterPatch(voterId, {
        verificationStatus: "blocked",
        isVerified: false,
        verified: false,
      });
      setEditMode(false);
      await fetchVoterData();
    } catch (err) {
      console.error("Failed to block voter:", err);
      alert("Failed to block voter");
    }
  };

  const handleRejectVoter = async (voterId) => {
    if (!voterId) return;
    try {
      await api.post(`/voters/admin/${voterId}/reject`);
      applyVoterPatch(voterId, {
        verificationStatus: "rejected",
        isVerified: false,
        verified: false,
      });
      setEditMode(false);
      await fetchVoterData();
    } catch (err) {
      console.error("Failed to reject voter:", err);
      alert("Failed to reject voter");
    }
  };

  const handleAddFormChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files?.[0];
      if (!file) {
        setAddForm((p) => ({ ...p, photo: null, photoPreview: "", photoData: "" }));
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        alert("Photo file is too large. Please upload an image up to 2MB.");
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setAddForm((p) => ({
          ...p,
          photo: file,
          photoPreview: dataUrl,
          photoData: dataUrl,
        }));
      } catch {
        alert("Failed to read photo file.");
      }
      return;
    }
    setAddForm((p) => ({ ...p, [name]: value }));
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
        dateOfBirth: addForm.dob || undefined,
        district: addForm.district,
        province: addForm.province,
        address: [addForm.district, addForm.province].filter(Boolean).join(", "),
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
      await fetchVoterData();
    } catch (err) {
      console.error("Failed to add voter:", err);
      const msg = err.isNetworkError
        ? "Backend unavailable: cannot create voter right now."
        : err.response?.data?.message || "Failed to add voter";
      alert(msg);
    }
  };

  const handleEditFormChange = async (event) => {
    const { name, value, files } = event.target;
    if (name === "photo") {
      const file = files?.[0];
      if (!file) return;
      if (file.size > MAX_PHOTO_BYTES) {
        alert("Photo file is too large. Please upload an image up to 2MB.");
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setEditForm((prev) => ({ ...prev, photoData: dataUrl }));
      } catch {
        alert("Failed to read photo file.");
      }
      return;
    }
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveVoterEdit = async () => {
    const voterId = selectedVoter?._id || selectedVoter?.id;
    if (!voterId) return;
    try {
      const payload = {
        fullName: editForm.fullName,
        email: editForm.email,
        mobile: editForm.mobile,
        voterId: editForm.voterId,
        district: editForm.district,
        province: editForm.province,
        address: [editForm.district, editForm.province].filter(Boolean).join(", "),
        dateOfBirth: editForm.dateOfBirth || undefined,
        photo: editForm.photoData || undefined,
      };

      const requestUpdate = (url, method = "put") =>
        api[method](url, payload, {
          validateStatus: (status) => status >= 200 && status < 500,
        });

      let response = await requestUpdate(`/voters/admin/${voterId}`);
      if (response.status === 404) {
        response = await requestUpdate(`/admin/voters/${voterId}`);
      }
      if (response.status === 404) {
        response = await requestUpdate(`/admin/voters/${voterId}`, "patch");
      }
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response?.data?.message || "Failed to update voter details");
      }

      await fetchVoterData();
      setEditMode(false);
      closeVoterDetails();
    } catch (err) {
      console.error("Failed to update voter:", err);
      alert(err.response?.data?.message || err.message || "Failed to update voter details");
    }
  };

  const votedCount = useMemo(
    () => voters.filter((v) => v.hasVoted || v.voted).length,
    [voters],
  );

  const statsCards = useMemo(() => {
    const total = Number(stats.totalRegistered || 0);
    const activeRate = total ? ((stats.activeVoters / total) * 100).toFixed(1) : null;
    const votedRate = total ? ((votedCount / total) * 100).toFixed(1) : null;
    const pendingRate = total ? ((stats.inactiveVoters / total) * 100).toFixed(1) : null;

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
  }, [stats, votedCount]);

  if (loading) {
    return (
      <div className="admin-page voters-page">
        <p>Loading voter data...</p>
      </div>
    );
  }

  const selectedStatus = normalizeVoterStatus(selectedVoter || {});
  const selectedVoterId = selectedVoter?._id || selectedVoter?.id;
  const selectedVoted = Boolean(selectedVoter?.hasVoted || selectedVoter?.voted);
  const selectedAvatar =
    editForm.photoData ||
    selectedVoter?.avatar ||
    selectedVoter?.photoUrl ||
    selectedVoter?.photo;

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
            {filteredVoters.length === 0 ? (
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
              filteredVoters.map((voter) => {
                const status = normalizeVoterStatus(voter);
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
                          <div className="voter-avatar">{voter.fullName?.[0] || "V"}</div>
                        )}
                        <div>
                          <div className="voter-name">{voter.fullName || "-"}</div>
                          <div className="voter-id">{voter.voterId || "-"}</div>
                          {isLocal && <div className="local-chip">Pending sync</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="voter-contact">
                        <div>{voter.email || "-"}</div>
                        <div className="muted">{voter.mobile || "-"}</div>
                      </div>
                    </td>
                    <td>
                      <div className="voter-location">
                        <div>{voter.district || "-"}</div>
                        <div className="muted">{voter.province || "-"}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${status.toLowerCase()}`}>{statusLabel(status)}</span>
                    </td>
                    <td>
                      <span className={`voted-badge ${voted ? "yes" : "no"}`}>
                        <i className={voted ? "ri-check-line" : "ri-close-line"} aria-hidden="true" />
                      </span>
                    </td>
                    <td className="align-right">
                      <button className="link-btn" onClick={() => openVoterDetails(voter)}>
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
                <input name="photo" type="file" accept="image/*" onChange={handleAddFormChange} />
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
                      <img src={addForm.photoPreview} alt="Preview" className="upload-thumb" />
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
        <div className="admin-modal-backdrop" onClick={closeVoterDetails}>
          <div className="admin-modal voter-details" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              {selectedAvatar ? (
                <img className="voter-avatar large photo" src={selectedAvatar} alt={selectedVoter.fullName} />
              ) : (
                <div className="voter-avatar large">{selectedVoter.fullName?.[0] || "V"}</div>
              )}
              <div>
                <div className="details-name">{selectedVoter.fullName}</div>
                <div className="details-id">Voter ID: {selectedVoter.voterId || "-"}</div>
                <div className="details-badges">
                  <span className={`status-badge ${selectedStatus.toLowerCase()}`}>
                    {statusLabel(selectedStatus)}
                  </span>
                  {selectedVoted && <span className="status-badge voted">Voted</span>}
                </div>
              </div>
            </div>

            {editMode ? (
              <div className="details-grid edit-grid">
                <label>
                  <div className="stat-label">Full Name</div>
                  <input name="fullName" value={editForm.fullName} onChange={handleEditFormChange} />
                </label>
                <label>
                  <div className="stat-label">Email</div>
                  <input name="email" type="email" value={editForm.email} onChange={handleEditFormChange} />
                </label>
                <label>
                  <div className="stat-label">Mobile</div>
                  <input name="mobile" value={editForm.mobile} onChange={handleEditFormChange} />
                </label>
                <label>
                  <div className="stat-label">Voter ID</div>
                  <input name="voterId" value={editForm.voterId} onChange={handleEditFormChange} />
                </label>
                <label>
                  <div className="stat-label">District</div>
                  <input name="district" value={editForm.district} onChange={handleEditFormChange} />
                </label>
                <label>
                  <div className="stat-label">Province</div>
                  <input name="province" value={editForm.province} onChange={handleEditFormChange} />
                </label>
                <label>
                  <div className="stat-label">Date of Birth</div>
                  <input name="dateOfBirth" type="date" value={editForm.dateOfBirth} onChange={handleEditFormChange} />
                </label>
                <label className="edit-photo-upload">
                  <div className="stat-label">Profile Photo</div>
                  <input name="photo" type="file" accept="image/*" onChange={handleEditFormChange} />
                </label>
              </div>
            ) : (
              <div className="details-grid">
                <div>
                  <div className="stat-label">Email</div>
                  <div className="stat-number">{selectedVoter.email || "-"}</div>
                </div>
                <div>
                  <div className="stat-label">Mobile</div>
                  <div className="stat-number">{selectedVoter.mobile || "-"}</div>
                </div>
                <div>
                  <div className="stat-label">District</div>
                  <div className="stat-number">{selectedVoter.district || "-"}</div>
                </div>
                <div>
                  <div className="stat-label">Province</div>
                  <div className="stat-number">{selectedVoter.province || "-"}</div>
                </div>
                <div>
                  <div className="stat-label">Date of Birth</div>
                  <div className="stat-number">
                    {selectedVoter.dateOfBirth
                      ? new Date(selectedVoter.dateOfBirth).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="stat-label">Address</div>
                  <div className="stat-number">{selectedVoter.address || "-"}</div>
                </div>
                <div>
                  <div className="stat-label">Created</div>
                  <div className="stat-number">
                    {selectedVoter.createdAt
                      ? new Date(selectedVoter.createdAt).toLocaleString()
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="stat-label">Last Updated</div>
                  <div className="stat-number">
                    {selectedVoter.updatedAt
                      ? new Date(selectedVoter.updatedAt).toLocaleString()
                      : "-"}
                  </div>
                </div>
              </div>
            )}

            <div className="admin-modal-actions">
              {editMode ? (
                <>
                  <button className="admin-button ghost wide" onClick={() => setEditMode(false)}>
                    Cancel Edit
                  </button>
                  <button className="admin-button success wide" onClick={handleSaveVoterEdit}>
                    Save Changes
                  </button>
                </>
              ) : selectedStatus !== "ACTIVE" ? (
                <>
                  <button className="admin-button ghost wide" onClick={() => setEditMode(true)}>
                    Edit Voter
                  </button>
                  <button className="admin-button success wide" onClick={() => handleApproveVoter(selectedVoterId)}>
                    Approve Voter
                  </button>
                </>
              ) : (
                <button className="admin-button primary danger-full" onClick={() => handleBlockVoter(selectedVoterId)}>
                  Block Voter
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
