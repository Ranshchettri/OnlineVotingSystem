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
  const [registerForm, setRegisterForm] = useState({
    name: "",
    leader: "",
    email: "",
    logo: null,
    documents: null,
  });

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

  return (
    <div className="admin-page parties-page">
      <div className="parties-header">
        <div>
          <div className="admin-section-title">Party Management</div>
          <div className="admin-section-subtitle">
            Register and manage political parties
          </div>
        </div>
        <button className="admin-button primary" onClick={() => setShowRegister(true)}>
          Register Party
        </button>
      </div>

      <div className="parties-stats">
        <div className="parties-stat-card">
          <div className="stat-label">Total Parties</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Registered parties</div>
        </div>
        <div className="parties-stat-card">
          <div className="stat-label">Active Parties</div>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-sub">89.4% active rate</div>
        </div>
        <div className="parties-stat-card">
          <div className="stat-label">Blocked Parties</div>
          <div className="stat-value">{stats.blocked}</div>
          <div className="stat-sub">Development below 40%</div>
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
              <button className="admin-button ghost">View Documents</button>
              <button className="admin-button ghost">Edit Analytics</button>
              <button className="admin-button primary">Block Party</button>
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
                <span>Click to upload party logo</span>
                <small>PNG, JPG up to 2MB</small>
              </label>
              <label className="file-drop">
                Verification Documents
                <input
                  type="file"
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, documents: e.target.files?.[0] })
                  }
                />
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
    </div>
  );
}
