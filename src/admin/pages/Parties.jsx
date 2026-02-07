import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../styles/partyManagement.css";

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

export default function Parties() {
  const [parties, setParties] = useState(fallbackParties);
  const [showRegister, setShowRegister] = useState(false);
  const [activeParty, setActiveParty] = useState(null);
  const [showDocs, setShowDocs] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [editValues, setEditValues] = useState({
    development: 72,
    goodWork: 85,
    badWork: 15,
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    leader: "",
    email: "",
    logo: null,
    documents: null,
  });
  const documents = [
    { name: "Registration Certificate", date: "2024-01-15", status: "Verified" },
    { name: "Party Constitution", date: "2024-01-15", status: "Verified" },
    { name: "Leader ID Proof", date: "2024-01-16", status: "Verified" },
    { name: "Financial Statement 2024", date: "2024-03-01", status: "Pending" },
  ];

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await api.get("/parties");
        const list = res.data?.data?.parties || res.data?.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((party) => ({
            id: party._id || party.id,
            name: party.name || party.partyName,
            leader: party.leaderName || party.leader,
            email: party.email || party.govEmail,
            logo: party.symbol || party.shortName || "P",
            development: party.developmentScore || 70,
            goodWork: party.goodWork || 80,
            badWork: party.badWork || 20,
            status: party.status || (party.isActive ? "Active" : "Blocked"),
          }));
          setParties(mapped);
        }
      } catch (err) {
        console.error("Failed to load parties:", err);
      }
    };

    fetchParties();
  }, []);

  const stats = useMemo(() => {
    const total = parties.length;
    const active = parties.filter((p) => p.status === "Active").length;
    const blocked = parties.filter((p) => p.status !== "Active").length;
    return { total, active, blocked };
  }, [parties]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", registerForm.name);
      fd.append("leaderName", registerForm.leader);
      fd.append("email", registerForm.email);
      if (registerForm.logo) fd.append("logo", registerForm.logo);
      if (registerForm.documents) fd.append("documents", registerForm.documents);
      await api.post("/parties", fd);
      setShowRegister(false);
    } catch (err) {
      console.error("Failed to register party:", err);
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

  return (
    <div className="admin-page parties-page">
      <div className="parties-header">
        <div>
          <div className="admin-section-title">Party Management</div>
          <div className="admin-section-subtitle">
            Register and manage political parties
          </div>
        </div>
        <button className="admin-button primary register-btn" onClick={() => setShowRegister(true)}>
          <i className="ri-flag-line" aria-hidden="true" />
          Register Party
        </button>
      </div>

      <div className="parties-stats">
        <div className="parties-stat-card">
          <div className="stat-top">
            <div className="stat-label">Total Parties</div>
            <span className="stat-icon total" aria-hidden="true">
              <i className="ri-file-list-line" />
            </span>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Registered parties</div>
        </div>
        <div className="parties-stat-card">
          <div className="stat-top">
            <div className="stat-label">Active Parties</div>
            <span className="stat-icon active" aria-hidden="true">
              <i className="ri-shield-check-line" />
            </span>
          </div>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-sub green">89.4% active rate</div>
        </div>
        <div className="parties-stat-card">
          <div className="stat-top">
            <div className="stat-label">Blocked Parties</div>
            <span className="stat-icon blocked" aria-hidden="true">
              <i className="ri-forbid-2-line" />
            </span>
          </div>
          <div className="stat-value">{stats.blocked}</div>
          <div className="stat-sub red">Development below 40%</div>
        </div>
      </div>

      <div className="parties-list">
        {parties.map((party) => (
          <div key={party.id} className="party-row">
            <div className="party-info">
              <div className="party-logo">{party.logo}</div>
              <div>
                <div className="party-name">{party.name}</div>
                <div className="party-meta">Leader: {party.leader}</div>
                <div className="party-meta muted">{party.email}</div>
              </div>
            </div>
            <div className="party-metrics">
              <div className="metric">
                <div className="metric-label">Development</div>
                <div className="metric-bar">
                  <span style={{ width: `${party.development}%` }} />
                </div>
                <div className="metric-value">{party.development}%</div>
              </div>
              <div className="metric">
                <div className="metric-label">Good Work</div>
                <div className="metric-bar good">
                  <span style={{ width: `${party.goodWork}%` }} />
                </div>
                <div className="metric-value">{party.goodWork}%</div>
              </div>
              <div className="metric">
                <div className="metric-label">Bad Work</div>
                <div className="metric-bar bad">
                  <span style={{ width: `${party.badWork}%` }} />
                </div>
                <div className="metric-value">{party.badWork}%</div>
              </div>
            </div>
            <div className="party-actions">
              <span className={`party-status ${party.status === "Active" ? "active" : "blocked"}`}>
                {party.status}
              </span>
              <div className="party-actions-row">
                <button className="admin-button ghost" onClick={() => openDocs(party)}>
                  <i className="ri-file-list-line" aria-hidden="true" />
                  View Documents
                </button>
                <button className="admin-button ghost" onClick={() => openEdit(party)}>
                  <i className="ri-edit-line" aria-hidden="true" />
                  Edit Analytics
                </button>
                <button className="admin-button primary" onClick={() => openBlock(party)}>
                  <i className="ri-forbid-2-line" aria-hidden="true" />
                  Block Party
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showRegister && (
        <div className="admin-modal-backdrop" onClick={() => setShowRegister(false)}>
          <div className="admin-modal party-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Register New Party</h3>
            <form className="party-form" onSubmit={handleRegisterSubmit}>
              <label>
                Party Name
                <input
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
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
                      setRegisterForm({ ...registerForm, leader: e.target.value })
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
                      setRegisterForm({ ...registerForm, email: e.target.value })
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
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, logo: e.target.files?.[0] })
                  }
                />
                <span className="file-drop-icon" aria-hidden="true">
                  <i className="ri-upload-cloud-line" />
                </span>
                <span>Click to upload party logo</span>
                <small>PNG, JPG up to 2MB</small>
              </label>
              <label className="file-drop danger">
                Verification Documents
                <input
                  type="file"
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, documents: e.target.files?.[0] })
                  }
                />
                <span className="file-drop-icon" aria-hidden="true">
                  <i className="ri-file-upload-line" />
                </span>
                <span>Upload registration documents</span>
                <small>PDF, DOC up to 10MB</small>
              </label>
              <div className="admin-modal-actions">
                <button className="admin-button ghost" type="button" onClick={() => setShowRegister(false)}>
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

      {showDocs && activeParty && (
        <div className="admin-modal-backdrop" onClick={() => setShowDocs(false)}>
          <div className="admin-modal party-docs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="party-modal-head">
              <div className="party-modal-title">
                <span className="party-logo">{activeParty.logo}</span>
                <div>
                  <div className="party-modal-name">{activeParty.name}</div>
                  <div className="party-modal-sub">Party Documents</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowDocs(false)}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
            <div className="docs-list">
              {documents.map((doc) => (
                <div key={doc.name} className="doc-item">
                  <div className="doc-left">
                    <span className="doc-icon">
                      <i className="ri-file-pdf-line" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="doc-title">{doc.name}</div>
                      <div className="doc-meta">Uploaded: {doc.date}</div>
                    </div>
                  </div>
                  <div className="doc-actions">
                    <span className={`doc-status ${doc.status.toLowerCase()}`}>
                      {doc.status}
                    </span>
                    <button className="admin-button ghost doc-btn">
                      <i className="ri-download-line" aria-hidden="true" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-modal-actions">
              <button className="admin-button ghost wide" onClick={() => setShowDocs(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && activeParty && (
        <div className="admin-modal-backdrop" onClick={() => setShowEdit(false)}>
          <div className="admin-modal party-edit-modal" onClick={(e) => e.stopPropagation()}>
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
              <button className="modal-close" onClick={() => setShowEdit(false)}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>

            <div className="slider-group">
              <div className="slider-label">Development Score: {editValues.development}%</div>
              <input
                type="range"
                min="0"
                max="100"
                value={editValues.development}
                onChange={(e) =>
                  setEditValues((p) => ({ ...p, development: Number(e.target.value) }))
                }
              />
            </div>
            <div className="slider-group">
              <div className="slider-label">Good Work: {editValues.goodWork}%</div>
              <input
                type="range"
                min="0"
                max="100"
                value={editValues.goodWork}
                onChange={(e) =>
                  setEditValues((p) => ({ ...p, goodWork: Number(e.target.value) }))
                }
              />
            </div>
            <div className="slider-group">
              <div className="slider-label">Bad Work: {editValues.badWork}%</div>
              <input
                type="range"
                min="0"
                max="100"
                value={editValues.badWork}
                onChange={(e) =>
                  setEditValues((p) => ({ ...p, badWork: Number(e.target.value) }))
                }
              />
            </div>
            <div className="info-callout">
              <i className="ri-alert-line" aria-hidden="true" />
              Changes will be visible to the party and all voters immediately.
            </div>
            <div className="admin-modal-actions">
              <button className="admin-button ghost wide" onClick={() => setShowEdit(false)}>
                Cancel
              </button>
              <button className="admin-button success wide" onClick={() => setShowEdit(false)}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlock && activeParty && (
        <div className="admin-modal-backdrop" onClick={() => setShowBlock(false)}>
          <div className="admin-modal party-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="party-modal-head">
              <div className="party-modal-title">
                <span className="modal-icon red">
                  <i className="ri-forbid-2-line" aria-hidden="true" />
                </span>
                <div>
                  <div className="party-modal-name">Block Party</div>
                  <div className="party-modal-sub">
                    Are you sure you want to block “{activeParty.name}”? This will
                    prevent them from participating in the election.
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-button ghost wide" onClick={() => setShowBlock(false)}>
                Cancel
              </button>
              <button className="admin-button primary wide" onClick={() => setShowBlock(false)}>
                Block Party
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
