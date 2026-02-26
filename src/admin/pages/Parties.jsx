import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../styles/partyManagement.css";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const MAX_DOC_BYTES = 8 * 1024 * 1024;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const normalizeDocuments = (documents = []) => {
  const source = Array.isArray(documents) ? documents : documents ? [documents] : [];
  return source
    .map((doc, index) => {
      if (!doc) return null;
      if (typeof doc === "string") {
        const mimeType = doc.match(/^data:([^;,]+)[;,]/i)?.[1] || "application/octet-stream";
        const extension = mimeType.includes("/") ? mimeType.split("/")[1] : "bin";
        return {
          name: `Document ${index + 1}.${extension}`,
          mimeType,
          size: 0,
          dataUrl: doc,
          uploadedAt: null,
        };
      }
      const dataUrl = doc.dataUrl || doc.url || doc.content || "";
      return {
        name: doc.name || doc.fileName || `Document ${index + 1}`,
        mimeType: doc.mimeType || doc.type || "application/octet-stream",
        size: Number(doc.size || 0) || 0,
        dataUrl,
        uploadedAt: doc.uploadedAt || doc.date || null,
      };
    })
    .filter(Boolean);
};

const resolvePartyStatus = (party = {}) => {
  const raw = String(party.status || "").toLowerCase();
  if (raw === "pending") return "PENDING";
  if (raw === "blocked" || raw === "rejected") return "BLOCKED";
  if (party.isActive === false) return "BLOCKED";
  if (raw === "approved" || raw === "active") return "ACTIVE";
  return "ACTIVE";
};

const mapPartyFromApi = (party = {}, idx = 0) => {
  const status = resolvePartyStatus(party);
  return {
    id: party._id || party.id,
    name: party.name || party.partyName || "Unnamed Party",
    leader: party.leaderName || party.leader || "",
    email: party.email || party.govEmail || "",
    logo: party.logo || party.symbol || party.shortName || "P",
    development: party.development ?? party.developmentScore ?? 0,
    goodWork: party.goodWork ?? 0,
    badWork: party.badWork ?? 0,
    isActive: status === "ACTIVE",
    status,
    share: party.share || "0%",
    rank: party.rank || idx + 1,
    documents: normalizeDocuments(party.documents || []),
  };
};

const legacyDemoDocuments = [
  {
    name: "Party Registration Certificate.pdf",
    mimeType: "application/pdf",
    size: 2.4 * 1024 * 1024,
    dataUrl: "",
    uploadedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    name: "Leader Citizenship Document.pdf",
    mimeType: "application/pdf",
    size: 1.8 * 1024 * 1024,
    dataUrl: "",
    uploadedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    name: "Party Constitution.pdf",
    mimeType: "application/pdf",
    size: 5.2 * 1024 * 1024,
    dataUrl: "",
    uploadedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    name: "Financial Statement 2024.pdf",
    mimeType: "application/pdf",
    size: 3.1 * 1024 * 1024,
    dataUrl: "",
    uploadedAt: "2024-12-05T00:00:00.000Z",
  },
];

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
    documentSize: 0,
    documentMimeType: "",
    electionId: "",
    electionType: "Political",
  });
  const documents =
    activeParty?.documents && activeParty.documents.length
      ? activeParty.documents
      : legacyDemoDocuments;
  const [elections, setElections] = useState([]);

  const applyPartyList = (list = []) => {
    const totalVotes = list.reduce((acc, p) => acc + (Number(p.totalVotes || 0) || 0), 0);
    const mapped = list.map((party, idx) => {
      const row = mapPartyFromApi(party, idx);
      return {
        ...row,
        share: totalVotes
          ? `${(((party.totalVotes || 0) / totalVotes) * 100).toFixed(1)}%`
          : "0%",
      };
    });
    setParties(mapped);
  };

  const loadParties = async () => {
    const res = await api.get("/parties");
    const list = res.data?.data?.parties || res.data?.data || res.data || [];
    if (!Array.isArray(list)) {
      setParties([]);
      setError("No parties returned from API yet.");
      return;
    }
    applyPartyList(list);
    setError(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partyRes, electionRes] = await Promise.all([
          api.get("/parties"),
          api.get("/elections"),
        ]);

        const list = partyRes.data?.data?.parties || partyRes.data?.data || partyRes.data || [];
        if (Array.isArray(list)) {
          applyPartyList(list);
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
        setElections(Array.isArray(electionList) ? electionList : []);
        if (!registerForm.electionId && Array.isArray(electionList) && electionList.length) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = parties.length;
    const active = parties.filter((p) => p.status === "ACTIVE").length;
    const blocked = parties.filter((p) => p.status === "BLOCKED").length;
    const pending = parties.filter((p) => p.status === "PENDING").length;
    return { total, active, blocked, pending };
  }, [parties]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const docsPayload = registerForm.documentData
        ? [
            {
              name: registerForm.documentName || "Party Document",
              mimeType: registerForm.documentMimeType || "application/octet-stream",
              size: registerForm.documentSize || 0,
              dataUrl: registerForm.documentData,
              uploadedAt: new Date().toISOString(),
            },
          ]
        : [];

      const payload = {
        name: registerForm.name,
        leader: registerForm.leader,
        email: registerForm.email,
        logo: registerForm.logoData,
        symbol: registerForm.logoData || registerForm.name?.slice(0, 2),
        documents: docsPayload,
        electionId: registerForm.electionId || undefined,
        electionType: registerForm.electionType || "Political",
      };
      try {
        await api.post("/parties", payload);
      } catch (firstError) {
        const errorMessage = String(
          firstError?.response?.data?.message || firstError?.message || "",
        ).toLowerCase();
        const isLegacyDocsCastError =
          errorMessage.includes("documents.0") &&
          (errorMessage.includes("cast") || errorMessage.includes("validation"));

        if (!isLegacyDocsCastError) throw firstError;

        // Retry for older backend schema where documents is [String].
        await api.post("/parties", {
          ...payload,
          documents: registerForm.documentData ? [registerForm.documentData] : [],
        });
      }
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
        documentSize: 0,
        documentMimeType: "",
        electionId: elections[0]?._id || elections[0]?.id || "",
        electionType:
          (elections[0]?.type || "Political").charAt(0).toUpperCase() +
          (elections[0]?.type || "Political").slice(1).toLowerCase(),
      });
      await loadParties();
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

  const saveEdit = async () => {
    if (!activeParty?.id) return;
    try {
      await api.put(`/admin/analytics/party/${activeParty.id}/update`, {
        development: Number(editValues.development),
        goodWork: Number(editValues.goodWork),
        badWork: Number(editValues.badWork),
      });
      await loadParties();
      setShowEdit(false);
      showToast(`${activeParty.name} analytics updated successfully.`);
    } catch (err) {
      console.error("Failed to update party analytics:", err);
      alert(err.response?.data?.message || "Failed to update party analytics");
    }
  };

  const confirmBlock = async () => {
    if (!activeParty?.id) return;
    const activating = activeParty.status !== "ACTIVE";
    try {
      await api.patch(`/parties/${activeParty.id}`, {
        isActive: activating,
        status: activating ? "approved" : "rejected",
      });
      await loadParties();
      setShowBlock(false);
      showToast(
        activating
          ? `${activeParty.name} activated successfully.`
          : `${activeParty.name} blocked successfully.`,
      );
    } catch (err) {
      console.error("Failed to update party status:", err);
      alert(err.response?.data?.message || "Failed to update party status");
    }
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
                  <div className="party-name-row">
                    <div className="party-name">{party.name}</div>
                    <span
                      className={`party-status-tag ${party.status.toLowerCase()}`}
                    >
                      {party.status === "ACTIVE"
                        ? "Active"
                        : party.status === "BLOCKED"
                          ? "Blocked"
                          : "Pending"}
                    </span>
                  </div>
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
                    className={`admin-button ${party.status === "ACTIVE" ? "primary" : "success"}`}
                    onClick={() => openBlock(party)}
                  >
                    <i
                      className={
                        party.status === "ACTIVE"
                          ? "ri-forbid-2-line"
                          : "ri-checkbox-circle-line"
                      }
                      aria-hidden="true"
                    />
                    {party.status === "ACTIVE"
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
                  onChange={async (e) => {
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
                    if (file.size > MAX_LOGO_BYTES) {
                      alert("Logo file is too large. Please upload an image up to 2MB.");
                      return;
                    }
                    try {
                      const dataUrl = await readFileAsDataUrl(file);
                      setRegisterForm((p) => ({
                        ...p,
                        logo: file,
                        logoPreview: dataUrl,
                        logoData: dataUrl,
                      }));
                    } catch {
                      alert("Failed to read logo file.");
                    }
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
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setRegisterForm((p) => ({
                        ...p,
                        documents: null,
                        documentData: "",
                        documentName: "",
                        documentSize: 0,
                        documentMimeType: "",
                      }));
                      return;
                    }
                    if (file.size > MAX_DOC_BYTES) {
                      alert("Document file is too large. Please upload a file up to 8MB.");
                      return;
                    }
                    try {
                      const dataUrl = await readFileAsDataUrl(file);
                      setRegisterForm((p) => ({
                        ...p,
                        documents: file,
                        documentData: dataUrl,
                        documentName: file.name,
                        documentSize: file.size,
                        documentMimeType: file.type || "application/octet-stream",
                      }));
                    } catch {
                      alert("Failed to read document file.");
                    }
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
                documents.map((doc, index) => (
                  <div key={`${doc.name}-${index}`} className="doc-item">
                    <div className="doc-left">
                      <span className="doc-icon">
                        <i className="ri-file-pdf-line" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="doc-title">{doc.name}</div>
                        <div className="doc-meta">
                          Uploaded:{" "}
                          {doc.uploadedAt
                            ? new Date(doc.uploadedAt).toLocaleDateString()
                            : "Not available"}
                          {doc.size ? ` · ${(doc.size / 1024 / 1024).toFixed(2)} MB` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="doc-actions">
                      <span className="doc-status">Uploaded</span>
                      <a
                        className="admin-button ghost doc-btn"
                        href={doc.dataUrl || "#"}
                        download={doc.name || `document-${index + 1}`}
                        onClick={(event) => {
                          if (!doc.dataUrl) {
                            event.preventDefault();
                            alert("No downloadable file data found for this document.");
                          }
                        }}
                      >
                        <i className="ri-download-line" aria-hidden="true" />
                        Download
                      </a>
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
                  className={`modal-icon ${activeParty.status === "ACTIVE" ? "red" : "green"}`}
                >
                  <i
                    className={
                      activeParty.status === "ACTIVE"
                        ? "ri-forbid-2-line"
                        : "ri-checkbox-circle-line"
                    }
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <div className="party-modal-name">
                    {activeParty.status === "ACTIVE"
                      ? "Block Party"
                      : "Activate Party"}
                  </div>
                  <div className="party-modal-sub">
                    {activeParty.status === "ACTIVE"
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
                  activeParty.status === "ACTIVE" ? "primary" : "success"
                }`}
                onClick={confirmBlock}
              >
                {activeParty.status === "ACTIVE"
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
