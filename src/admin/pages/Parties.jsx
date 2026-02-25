import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../styles/partyManagement.css";

/* Demo seed data disabled as requested
const fallbackParties = [
  {
    id: "p1",
    name: "Nepal Communist Party (UML)",
    leader: "K.P. Sharma Oli",
    email: "uml_gov@ovs.test",
    logo: "N",
    development: 72,
    goodWork: 85,
    badWork: 15,
    status: "Active",
  },
  {
    id: "p2",
    name: "Nepali Congress",
    leader: "Sher Bahadur Deuba",
    email: "congress_gov@ovs.test",
    logo: "NC",
    development: 68,
    goodWork: 78,
    badWork: 22,
    status: "Active",
  },
  {
    id: "p3",
    name: "Rastriya Swatantra Party",
    leader: "Rabi Lamichhane",
    email: "rsp_gov@ovs.test",
    logo: "RSP",
    development: 45,
    goodWork: 62,
    badWork: 38,
    status: "Active",
  },
];
*/

export default function Parties() {
  const [parties, setParties] = useState([]);
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeParty, setActiveParty] = useState(null);
  const [showDocs, setShowDocs] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [toast, setToast] = useState(null);
  const [editValues, setEditValues] = useState({
    development: 0,
    goodWork: 0,
    badWork: 0,
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    leader: "",
    email: "",
    logo: null,
    logoPreview: "",
    logoData: "",
    documents: null,
    documentData: "",
    documentName: "",
    electionId: "",
    electionType: "Political",
  });
  const documents = activeParty?.documents || [];
  const [elections, setElections] = useState([]);

  const fileToDataUrl = (file, cb) => {
    if (!file) return cb("");
    const reader = new FileReader();
    reader.onload = () => cb(reader.result);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partyRes, electionRes] = await Promise.all([
          api.get("/parties"),
          api.get("/elections"),
        ]);

        const list =
          partyRes.data?.data?.parties || partyRes.data?.data || partyRes.data;
        if (Array.isArray(list)) {
          const totalVotes = list.reduce(
            (acc, p) => acc + (p.totalVotes || 0),
            0,
          );
          const mapped = list.map((party, idx) => ({
            id: party._id || party.id,
            name: party.name || party.partyName,
            leader: party.leaderName || party.leader,
            email: party.email || party.govEmail,
            logo: party.logo || party.symbol || party.shortName || "P",
            development: party.development ?? party.developmentScore ?? 70,
            goodWork: party.goodWork ?? 80,
            badWork: party.badWork ?? 20,
            status: party.status || (party.isActive ? "Active" : "Blocked"),
            share: totalVotes
              ? `${(((party.totalVotes || 0) / totalVotes) * 100).toFixed(1)}%`
              : "0%",
            rank: idx + 1,
            documents: party.documents || [],
          }));
          setParties(mapped);
          setError(null);
        } else {
          setParties([]);
          setError("No parties returned from API yet.");
        }

        const electionList =
          electionRes.data?.data?.elections ||
          electionRes.data?.data ||
          electionRes.data ||
          [];
        setElections(electionList);
        if (!registerForm.electionId && electionList.length) {
          setRegisterForm((p) => ({
            ...p,
            electionId: electionList[0]._id || electionList[0].id,
            electionType:
              (electionList[0].type || p.electionType).charAt(0).toUpperCase() +
              (electionList[0].type || p.electionType).slice(1).toLowerCase(),
          }));
        }
      } catch (err) {
        console.error("Failed to load parties:", err);
        setParties([]);
        if (err.isNetworkError) {
          setError("Backend offline: could not reach parties API.");
        } else if (err.isUnauthorized) {
          setError("Unauthorized: please log in as admin.");
        } else {
          setError("Failed to load parties");
        }
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const total = parties.length;
    const active = parties.filter(
      (p) => p.status === "Active" || p.status === "APPROVED" || p.isActive,
    ).length;
    const blocked = parties.filter(
      (p) =>
        p.status &&
        p.status !== "Active" &&
        p.status !== "APPROVED" &&
        !p.isActive,
    ).length;
    const pending = parties.filter((p) => p.status === "PENDING").length;
    return { total, active, blocked, pending };
  }, [parties]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: registerForm.name,
        leader: registerForm.leader,
        email: registerForm.email,
        logo: registerForm.logoData,
        symbol: registerForm.logoData || registerForm.name?.slice(0, 2),
        documents: registerForm.documentData ? [registerForm.documentData] : [],
        electionId: registerForm.electionId || undefined,
        electionType: registerForm.electionType || "Political",
      };
      await api.post("/parties", payload);
      setShowRegister(false);
      setRegisterForm({
        name: "",
        leader: "",
        email: "",
        logo: null,
        logoPreview: "",
        logoData: "",
        documents: null,
        documentData: "",
        documentName: "",
        electionId: elections[0]?._id || elections[0]?.id || "",
        electionType:
          (elections[0]?.type || "Political").charAt(0).toUpperCase() +
          (elections[0]?.type || "Political").slice(1).toLowerCase(),
      });
      // Refresh list
      const res = await api.get("/parties");
      const list = res.data?.data?.parties || res.data?.data || res.data;
      setParties(
        (list || []).map((party, idx) => ({
          id: party._id || party.id,
          name: party.name || party.partyName,
          leader: party.leaderName || party.leader,
          email: party.email || party.govEmail,
          logo: party.logo || party.symbol || party.shortName || "P",
          development: party.development ?? party.developmentScore ?? 70,
          goodWork: party.goodWork ?? 80,
          badWork: party.badWork ?? 20,
          status: party.status || (party.isActive ? "Active" : "Blocked"),
          rank: idx + 1,
        })),
      );
    } catch (err) {
      console.error("Failed to register party:", err);
      const msg = err.isNetworkError
        ? "Backend unavailable: cannot register party right now."
        : err.response?.data?.message || "Failed to register party";
      alert(msg);
    }
  };

  const openDocs = (party) => {
    setActiveParty(party);
    setShowDocs(true);
  };

  const openEdit = (party) => {
    setActiveParty(party);
    setEditValues({
      development: party.development,
      goodWork: party.goodWork,
      badWork: party.badWork,
    });
    setShowEdit(true);
  };

  const openBlock = (party) => {
    setActiveParty(party);
    setShowBlock(true);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const saveEdit = () => {
    setParties((prev) =>
      prev.map((p) =>
        p.id === activeParty.id
          ? {
              ...p,
              development: editValues.development,
              goodWork: editValues.goodWork,
              badWork: editValues.badWork,
            }
          : p,
      ),
    );
    setShowEdit(false);
    showToast(`${activeParty.name} analytics updated successfully!`);
  };

  const confirmBlock = () => {
    const isBlocked = activeParty.status !== "Active";
    setParties((prev) =>
      prev.map((p) =>
        p.id === activeParty.id
          ? { ...p, status: isBlocked ? "Active" : "Blocked" }
          : p,
      ),
    );
    setShowBlock(false);
    showToast(
      isBlocked
        ? `${activeParty.name} has been activated successfully!`
        : `${activeParty.name} has been blocked successfully!`,
    );
  };

  return (
    <div className="admin-page parties-page">
      <div className="parties-header">
        <div>
          <div className="admin-section-title">Party Management</div>
          <div className="admin-section-subtitle">
            Register and manage political parties
          </div>
        </div>
        <button
          className="admin-button primary register-btn"
          onClick={() => setShowRegister(true)}
        >
          <i className="ri-flag-line" aria-hidden="true" />
          Register Party
        </button>
      </div>

      {error && <div className="parties-error">{error}</div>}

      <div className="parties-stats">
        <div className="parties-stat-card">
          <div className="stat-top">
            <div className="stat-label">Total Parties</div>
            <span className="stat-icon total" aria-hidden="true">
              <i className="ri-file-list-line" />
            </span>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">
            {stats.total ? "Registered parties" : "Awaiting data"}
          </div>
        </div>
        <div className="parties-stat-card">
          <div className="stat-top">
            <div className="stat-label">Active Parties</div>
            <span className="stat-icon active" aria-hidden="true">
              <i className="ri-shield-check-line" />
            </span>
          </div>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-sub green">
            {stats.total
              ? `${((stats.active / stats.total) * 100 || 0).toFixed(1)}% active rate`
              : "Awaiting data"}
          </div>
        </div>
        <div className="parties-stat-card">
          <div className="stat-top">
            <div className="stat-label">Blocked Parties</div>
            <span className="stat-icon blocked" aria-hidden="true">
              <i className="ri-forbid-2-line" />
            </span>
          </div>
          <div className="stat-value">{stats.blocked}</div>
          <div className="stat-sub red">
            {stats.total
              ? stats.pending
                ? `${stats.pending} pending approvals`
                : "No pending approvals"
              : "Awaiting data"}
          </div>
        </div>
      </div>

      <div className="parties-list">
        {parties.length === 0 ? (
          <div className="parties-empty">
            <span className="empty-icon" aria-hidden="true">
              <i className="ri-database-2-line" />
            </span>
            <div>No parties to display</div>
            <div className="muted">
              Register or fetch parties to populate this list.
            </div>
          </div>
        ) : (
          parties.map((party) => (
            <div key={party.id} className="party-row">
              <div className="party-info">
                <div className="party-logo">
                  {party.logo &&
                  (party.logo.startsWith("data:") ||
                    party.logo.startsWith("http")) ? (
                    <img src={party.logo} alt={party.name} />
                  ) : (
                    party.logo || "P"
                  )}
                </div>
                <div>
                  <div className="party-name">{party.name}</div>
                  <div className="party-meta line">
                    <span className="label">Leader:</span>
                    <span className="value">{party.leader || "—"}</span>
                  </div>
                  <div className="party-meta muted">{party.email || "—"}</div>
                </div>
              </div>
              <div className="party-metrics">
                <div className="metric">
                  <div className="metric-label">Development</div>
                  <div className="metric-bar">
                    <span style={{ width: `${party.development || 0}%` }} />
                  </div>
                  <div className="metric-value">{party.development ?? 0}%</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Good Work</div>
                  <div className="metric-bar good">
                    <span style={{ width: `${party.goodWork || 0}%` }} />
                  </div>
                  <div className="metric-value">{party.goodWork ?? 0}%</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Bad Work</div>
                  <div className="metric-bar bad">
                    <span style={{ width: `${party.badWork || 0}%` }} />
                  </div>
                  <div className="metric-value">{party.badWork ?? 0}%</div>
                </div>
              </div>
              <div className="party-actions">
                <span
                  className={`party-status ${party.status === "Active" ? "active" : "blocked"}`}
                >
                  {party.status || "—"}
                </span>
                <div className="party-actions-row">
                  <button
                    className="admin-button ghost"
                    onClick={() => openDocs(party)}
                  >
                    <i className="ri-file-list-line" aria-hidden="true" />
                    View Documents
                  </button>
                  <button
                    className="admin-button ghost"
                    onClick={() => openEdit(party)}
                  >
                    <i className="ri-edit-line" aria-hidden="true" />
                    Edit Analytics
                  </button>
                  <button
                    className="admin-button primary"
                    onClick={() => openBlock(party)}
                  >
                    <i
                      className={
                        party.status === "Active"
                          ? "ri-forbid-2-line"
                          : "ri-checkbox-circle-line"
                      }
                      aria-hidden="true"
                    />
                    {party.status === "Active"
                      ? "Block Party"
                      : "Activate Party"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showRegister && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowRegister(false)}
        >
          <div
            className="admin-modal party-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Register New Party</h3>
            <form className="party-form" onSubmit={handleRegisterSubmit}>
              <label>
                Party Name
                <input
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, name: e.target.value })
                  }
                  placeholder="Enter party name"
                  required
                />
              </label>
              <div className="two-col">
                <label>
                  Party Leader
                  <input
                    value={registerForm.leader}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        leader: e.target.value,
                      })
                    }
                    placeholder="Leader name"
                    required
                  />
                </label>
                <label>
                  Government Email
                  <input
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="party_gov@ovs.test"
                    required
                  />
                </label>
              </div>
              <label className="file-drop">
                Party Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setRegisterForm((p) => ({
                        ...p,
                        logo: null,
                        logoPreview: "",
                        logoData: "",
                      }));
                      return;
                    }
                    fileToDataUrl(file, (dataUrl) => {
                      setRegisterForm((p) => ({
                        ...p,
                        logo: file,
                        logoPreview: dataUrl,
                        logoData: dataUrl,
                      }));
                    });
                  }}
                />
                <span className="file-drop-icon" aria-hidden="true">
                  <i className="ri-upload-cloud-line" />
                </span>
                <span>Click to upload party logo</span>
                <small>PNG, JPG up to 2MB</small>
                {registerForm.logo && (
                  <div className="upload-preview">
                    <i className="ri-image-line" aria-hidden="true" />{" "}
                    {registerForm.logo.name}
                    {registerForm.logoPreview ? (
                      <img
                        src={registerForm.logoPreview}
                        alt="Logo preview"
                        className="upload-thumb"
                      />
                    ) : null}
                  </div>
                )}
              </label>
              <label className="file-drop danger">
                Verification Documents
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setRegisterForm((p) => ({
                        ...p,
                        documents: null,
                        documentData: "",
                        documentName: "",
                      }));
                      return;
                    }
                    fileToDataUrl(file, (dataUrl) => {
                      setRegisterForm((p) => ({
                        ...p,
                        documents: file,
                        documentData: dataUrl,
                        documentName: file.name,
                      }));
                    });
                  }}
                />
                <span className="file-drop-icon" aria-hidden="true">
                  <i className="ri-file-upload-line" />
                </span>
                <span>Upload registration documents</span>
                <small>PDF, DOC up to 10MB</small>
                {registerForm.documents && (
                  <div className="upload-preview">
                    <i className="ri-file-pdf-2-line" aria-hidden="true" />{" "}
                    {registerForm.documents.name}
                  </div>
                )}
              </label>
              <div className="admin-modal-actions">
                <button
                  className="admin-button ghost"
                  type="button"
                  onClick={() => setShowRegister(false)}
                >
                  Cancel
                </button>
                <button className="admin-button primary" type="submit">
                  Register Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="admin-toast success">
          <i className="ri-checkbox-circle-line" aria-hidden="true" />
          {toast}
        </div>
      )}

      {showDocs && activeParty && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowDocs(false)}
        >
          <div
            className="admin-modal party-docs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="party-modal-head">
              <div className="party-modal-title">
                <span className="party-logo">{activeParty.logo}</span>
                <div>
                  <div className="party-modal-name">{activeParty.name}</div>
                  <div className="party-modal-sub">Party Documents</div>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowDocs(false)}
              >
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
            <div className="docs-list">
              {documents.length === 0 ? (
                <div className="doc-empty">
                  <span className="doc-icon muted">
                    <i className="ri-inbox-line" aria-hidden="true" />
                  </span>
                  <div>No documents uploaded yet</div>
                  <div className="doc-meta">
                    Party files will appear here once submitted.
                  </div>
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.name} className="doc-item">
                    <div className="doc-left">
                      <span className="doc-icon">
                        <i className="ri-file-pdf-line" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="doc-title">{doc.name}</div>
                        <div className="doc-meta">
                          Uploaded: {doc.date || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="doc-actions">
                      <span
                        className={`doc-status ${(doc.status || "pending").toLowerCase()}`}
                      >
                        {doc.status || "Pending"}
                      </span>
                      <button className="admin-button ghost doc-btn">
                        <i className="ri-download-line" aria-hidden="true" />
                        Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="admin-modal-actions">
              <button
                className="admin-button ghost wide"
                onClick={() => setShowDocs(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && activeParty && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="admin-modal party-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="party-modal-head">
              <div className="party-modal-title">
                <span className="modal-icon amber">
                  <i className="ri-bar-chart-box-line" aria-hidden="true" />
                </span>
                <div>
                  <div className="party-modal-name">Edit Analytics</div>
                  <div className="party-modal-sub">{activeParty.name}</div>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowEdit(false)}
              >
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>

            <div className="slider-group">
              <div className="slider-label">
                Development Score: {editValues.development}%
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={editValues.development}
                onChange={(e) =>
                  setEditValues((p) => ({
                    ...p,
                    development: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="slider-group">
              <div className="slider-label">
                Good Work: {editValues.goodWork}%
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={editValues.goodWork}
                onChange={(e) =>
                  setEditValues((p) => ({
                    ...p,
                    goodWork: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="slider-group">
              <div className="slider-label">
                Bad Work: {editValues.badWork}%
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={editValues.badWork}
                onChange={(e) =>
                  setEditValues((p) => ({
                    ...p,
                    badWork: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="info-callout">
              <i className="ri-alert-line" aria-hidden="true" />
              Changes will be visible to the party and all voters immediately.
            </div>
            <div className="admin-modal-actions">
              <button
                className="admin-button ghost wide"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
              <button className="admin-button success wide" onClick={saveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlock && activeParty && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowBlock(false)}
        >
          <div
            className="admin-modal party-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="party-modal-head">
              <div className="party-modal-title">
                <span
                  className={`modal-icon ${activeParty.status === "Active" ? "red" : "green"}`}
                >
                  <i
                    className={
                      activeParty.status === "Active"
                        ? "ri-forbid-2-line"
                        : "ri-checkbox-circle-line"
                    }
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <div className="party-modal-name">
                    {activeParty.status === "Active"
                      ? "Block Party"
                      : "Activate Party"}
                  </div>
                  <div className="party-modal-sub">
                    {activeParty.status === "Active"
                      ? `Are you sure you want to block "${activeParty.name}"? This will prevent them from participating in the election.`
                      : `Are you sure you want to activate "${activeParty.name}"? This will allow them to participate in the election.`}
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button
                className="admin-button ghost wide"
                onClick={() => setShowBlock(false)}
              >
                Cancel
              </button>
              <button
                className={`admin-button wide ${
                  activeParty.status === "Active" ? "primary" : "success"
                }`}
                onClick={confirmBlock}
              >
                {activeParty.status === "Active"
                  ? "Block Party"
                  : "Activate Party"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
