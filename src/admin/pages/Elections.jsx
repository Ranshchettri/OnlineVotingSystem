import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/elections.css";

const fallbackElections = [
  {
    id: "e1",
    title: "National Parliamentary Election 2025",
    type: "Political",
    status: "Running",
    startDate: "2025-03-15T07:00:00",
    endDate: "2025-03-15T17:00:00",
    totalVotes: "1,947,283",
    turnout: "68.4%",
    autoClose: true,
    autoResults: true,
  },
  {
    id: "e2",
    title: "Provincial Assembly Election",
    type: "Political",
    status: "Upcoming",
    startDate: "2025-04-20T07:00:00",
    endDate: "2025-04-20T17:00:00",
    totalVotes: "0",
    turnout: "0%",
    autoClose: true,
    autoResults: true,
  },
  {
    id: "e3",
    title: "Student Union Election 2025",
    type: "Student",
    status: "Ended",
    startDate: "2025-02-10T09:00:00",
    endDate: "2025-02-10T16:00:00",
    totalVotes: "45,892",
    turnout: "82.3%",
    autoClose: true,
    autoResults: true,
  },
];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function Elections() {
  const [elections, setElections] = useState(fallbackElections);
  const [showCreate, setShowCreate] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    title: "",
    type: "Political",
    startDate: "",
    endDate: "",
    autoClose: true,
    autoResults: true,
    emergencyShutdown: true,
    tieHandling: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get("/elections");
        const list = res.data?.data?.elections || res.data?.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((e) => ({
            id: e._id || e.id,
            title: e.title || e.name,
            type: e.type ? e.type[0].toUpperCase() + e.type.slice(1) : "Political",
            status: e.status || "Upcoming",
            startDate: e.startDate || e.start_time || e.start,
            endDate: e.endDate || e.end_time || e.end,
            totalVotes: e.totalVotes?.toLocaleString?.() || e.totalVotes || "0",
            turnout: e.turnout ? `${e.turnout}%` : e.turnout || "0%",
            autoClose: e.autoClose ?? true,
            autoResults: e.autoResults ?? true,
          }));
          setElections(mapped);
        }
      } catch (err) {
        console.error("Failed to load elections:", err);
      }
    };

    fetchElections();
  }, []);

  const handleCreateElection = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/elections", {
        title: form.title,
        type: form.type.toLowerCase(),
        startDate: form.startDate,
        endDate: form.endDate,
        autoClose: form.autoClose,
        autoResults: form.autoResults,
        emergencyShutdown: form.emergencyShutdown,
        tieHandling: form.tieHandling,
      });
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create election:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page admin-elections">
      <div className="admin-elections__header">
        <div>
          <div className="admin-section-title">Election Management</div>
          <div className="admin-section-subtitle">
            Create and manage elections
          </div>
        </div>
        <button className="admin-button primary" onClick={() => setShowCreate(true)}>
          + Create Election
        </button>
      </div>

      <div className="admin-elections__list">
        {elections.map((election) => (
          <div key={election.id} className="admin-elections__card">
            <div className="admin-elections__card-header">
              <div>
                <div className="election-title">{election.title}</div>
                <div className="election-tags">
                  <span
                    className={`admin-pill ${
                      election.status?.toLowerCase() === "running"
                        ? "green"
                        : election.status?.toLowerCase() === "upcoming"
                          ? "blue"
                          : "red"
                    }`}
                  >
                    {election.status}
                  </span>
                  <span className="admin-pill purple">{election.type}</span>
                </div>
              </div>
              <div className="election-actions">
                <button
                  className="admin-button ghost"
                  onClick={() => setPreview(election)}
                >
                  Preview
                </button>
                {election.status?.toLowerCase() === "running" && (
                  <button className="admin-button primary">Stop</button>
                )}
              </div>
            </div>

            <div className="admin-elections__card-dates">
              <div>
                <span>Start:</span> {formatDate(election.startDate)}
              </div>
              <div>
                <span>End:</span> {formatDate(election.endDate)}
              </div>
            </div>

            <div className="admin-elections__stats">
              <div>
                <div className="stat-label">Total Votes</div>
                <div className="stat-number">{election.totalVotes}</div>
              </div>
              <div>
                <div className="stat-label">Turnout</div>
                <div className="stat-number">{election.turnout}</div>
              </div>
              <div>
                <div className="stat-label">Auto Close</div>
                <div className="stat-number">
                  {election.autoClose ? "Enabled" : "Disabled"}
                </div>
              </div>
              <div>
                <div className="stat-label">Auto Results</div>
                <div className="stat-number">
                  {election.autoResults ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="admin-modal admin-elections__modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Election</h3>
            <form className="admin-elections__form" onSubmit={handleCreateElection}>
              <label>
                Election Title
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., National Parliamentary Election 2025"
                  required
                />
              </label>
              <label>
                Election Type
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option>Political</option>
                  <option>Student</option>
                </select>
              </label>
              <div className="two-col">
                <label>
                  Start Date & Time
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </label>
                <label>
                  End Date & Time
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="checkbox-grid">
                <label>
                  <input
                    type="checkbox"
                    checked={form.autoClose}
                    onChange={(e) => setForm({ ...form, autoClose: e.target.checked })}
                  />
                  Auto-close on end date
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.autoResults}
                    onChange={(e) => setForm({ ...form, autoResults: e.target.checked })}
                  />
                  Auto winner calculation
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.emergencyShutdown}
                    onChange={(e) =>
                      setForm({ ...form, emergencyShutdown: e.target.checked })
                    }
                  />
                  Enable emergency shutdown
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.tieHandling}
                    onChange={(e) => setForm({ ...form, tieHandling: e.target.checked })}
                  />
                  Tie-handling logic
                </label>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-button ghost"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button className="admin-button primary" type="submit" disabled={loading}>
                  Create Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {preview && (
        <div className="admin-modal-backdrop" onClick={() => setPreview(null)}>
          <div className="admin-modal admin-elections__preview" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <div className="preview-title">{preview.title}</div>
              <div className="preview-tags">
                <span className="admin-pill green">{preview.status}</span>
                <span className="admin-pill purple">{preview.type}</span>
              </div>
            </div>
            <div className="preview-grid">
              <div>
                <div className="stat-label">Start Date & Time</div>
                <div className="stat-number">{formatDate(preview.startDate)}</div>
              </div>
              <div>
                <div className="stat-label">End Date & Time</div>
                <div className="stat-number">{formatDate(preview.endDate)}</div>
              </div>
              <div>
                <div className="stat-label">Total Votes Cast</div>
                <div className="stat-number">{preview.totalVotes}</div>
              </div>
              <div>
                <div className="stat-label">Voter Turnout</div>
                <div className="stat-number">{preview.turnout}</div>
              </div>
            </div>
            <div className="preview-settings">
              <div className="preview-setting">
                <span>Auto-close on end date</span>
                <span>{preview.autoClose ? "Enabled" : "Disabled"}</span>
              </div>
              <div className="preview-setting">
                <span>Auto winner calculation</span>
                <span>{preview.autoResults ? "Enabled" : "Disabled"}</span>
              </div>
              <div className="preview-setting">
                <span>Emergency shutdown</span>
                <span>Available</span>
              </div>
              <div className="preview-setting">
                <span>Tie-handling logic</span>
                <span>Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
