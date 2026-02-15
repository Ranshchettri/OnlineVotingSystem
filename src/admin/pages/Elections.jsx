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
    totalVotes: 1947283,
    turnout: "68.4%",
    autoClose: true,
    autoResults: true,
    parties: [
      { name: "Nepal Communist Party (UML)", leader: "K.P. Sharma Oli", votes: 545238, percentage: "28.0%" },
      { name: "Nepali Congress", leader: "Sher Bahadur Deuba", votes: 487321, percentage: "25.0%" },
      { name: "CPN (Maoist Centre)", leader: "Pushpa Kamal Dahal", votes: 389456, percentage: "20.0%" },
      { name: "Rastriya Swatantra Party", leader: "Rabi Lamichhane", votes: 311565, percentage: "16.0%" },
      { name: "Rastriya Prajatantra Party", leader: "Rajendra Lingden", votes: 213703, percentage: "11.0%" },
    ],
  },
  {
    id: "e2",
    title: "Provincial Assembly Election",
    type: "Political",
    status: "Upcoming",
    startDate: "2025-04-20T07:00:00",
    endDate: "2025-04-20T17:00:00",
    totalVotes: 0,
    turnout: "0%",
    autoClose: true,
    autoResults: true,
    parties: [
      { name: "Province Reform Party", leader: "Anil KC", votes: 0, percentage: "0%" },
      { name: "United Students Front", leader: "Kiran Rai", votes: 0, percentage: "0%" },
    ],
  },
  {
    id: "e3",
    title: "Student Union Election 2025",
    type: "Student",
    status: "Ended",
    startDate: "2025-02-10T09:00:00",
    endDate: "2025-02-10T16:00:00",
    totalVotes: 45892,
    turnout: "82.3%",
    autoClose: true,
    autoResults: true,
    parties: [
      { name: "All Nepal Student Union", leader: "Suman Shrestha", votes: 19820, percentage: "43.2%" },
      { name: "Free Student Union", leader: "Mina Thapa", votes: 16540, percentage: "36.1%" },
      { name: "Independent Panel", leader: "Bibek Gurung", votes: 9542, percentage: "20.7%" },
    ],
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

const formatVotes = (value) =>
  typeof value === "number" ? value.toLocaleString() : value || "0";

export default function Elections() {
  const [elections, setElections] = useState(fallbackElections);
  const [showCreate, setShowCreate] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportElection, setExportElection] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(null);
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
          const mapped = list.map((e) => {
            const totalVotesValue =
              typeof e.totalVotes === "number"
                ? e.totalVotes
                : Number(e.totalVotes || 0);
            return {
              id: e._id || e.id,
              title: e.title || e.name,
              type: e.type ? e.type[0].toUpperCase() + e.type.slice(1) : "Political",
              status: e.status || "Upcoming",
              startDate: e.startDate || e.start_time || e.start,
              endDate: e.endDate || e.end_time || e.end,
              totalVotes: totalVotesValue,
              turnout: e.turnout ? `${e.turnout}%` : e.turnout || "0%",
              autoClose: e.autoClose ?? true,
              autoResults: e.autoResults ?? true,
              parties: e.parties || [],
            };
          });
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

  const handleExport = (election) => {
    setExportElection(election);
    setShowExport(true);
  };

  const generateCSV = (election) => {
    if (!election) return;
    const parties = election.parties || [];
    const headers = ["Party Name", "Leader", "Total Votes", "Vote Percentage"];
    const rows = parties.map((p) => [
      p.name,
      p.leader,
      typeof p.votes === "number" ? p.votes : p.votes || 0,
      p.percentage,
    ]);

    const csvContent = [
      [`Election Report: ${election.title}`],
      [`Type: ${election.type}`],
      [`Status: ${election.status}`],
      [`Start: ${formatDate(election.startDate)}`],
      [`End: ${formatDate(election.endDate)}`],
      [
        `Total Votes: ${
          typeof election.totalVotes === "number"
            ? election.totalVotes.toLocaleString()
            : election.totalVotes
        }`,
      ],
      [`Voter Turnout: ${election.turnout}`],
      [],
      headers,
      ...rows,
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${election.title.replace(/\s+/g, "_")}_Report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportSuccess("Excel (CSV) report downloaded successfully!");
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const generatePDFReport = (election) => {
    if (!election) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const parties = election.parties || [];
    const partyRows = parties
      .map(
        (p, i) => `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px 16px;font-size:14px;color:#374151;">${i + 1}</td>
          <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#111827;">${p.name}</td>
          <td style="padding:12px 16px;font-size:14px;color:#374151;">${p.leader}</td>
          <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#111827;">${
            typeof p.votes === "number" ? p.votes.toLocaleString() : p.votes
          }</td>
          <td style="padding:12px 16px;font-size:14px;color:#374151;">${p.percentage}</td>
          <td style="padding:12px 16px;">
            <div style="background:#e5e7eb;border-radius:999px;height:8px;width:100%;overflow:hidden;">
              <div style="background:${i === 0 ? "#10b981" : i === 1 ? "#3b82f6" : "#f59e0b"};height:100%;width:${p.percentage};border-radius:999px;"></div>
            </div>
          </td>
        </tr>`,
      )
      .join("");

    const winner = parties.length > 0 ? parties[0] : null;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${election.title} - Report</title>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin:0; padding:40px; background:#fff; color:#111827;
          }
          .header {
            text-align:center; margin-bottom:40px; padding-bottom:24px;
            border-bottom:3px solid #dc2626;
          }
          .header h1 { font-size:28px; margin:0 0 8px; color:#111827; }
          .header p { font-size:14px; color:#6b7280; margin:4px 0; }
          .stats-grid {
            display:grid; grid-template-columns:repeat(4,1fr);
            gap:16px; margin-bottom:32px;
          }
          .stat-card {
            background:#f9fafb; border:1px solid #e5e7eb;
            border-radius:12px; padding:20px; text-align:center;
          }
          .stat-card .value { font-size:24px; font-weight:700; color:#111827; }
          .stat-card .label { font-size:12px; color:#6b7280; margin-top:4px; }
          table {
            width:100%; border-collapse:collapse; border:1px solid #e5e7eb;
            border-radius:12px; overflow:hidden;
          }
          th {
            background:#f9fafb; padding:12px 16px; text-align:left;
            font-size:12px; text-transform:uppercase;
          }
          .winner-box {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin-bottom: 32px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🇳🇵 Nepal Online Voting System</h1>
          <p style="font-size:20px;font-weight:700;color:#dc2626;">${election.title}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="value">${
              typeof election.totalVotes === "number"
                ? election.totalVotes.toLocaleString()
                : election.totalVotes
            }</div>
            <div class="label">Total Votes</div>
          </div>
          <div class="stat-card">
            <div class="value">${election.turnout}</div>
            <div class="label">Voter Turnout</div>
          </div>
          <div class="stat-card">
            <div class="value">${parties.length}</div>
            <div class="label">Parties</div>
          </div>
          <div class="stat-card">
            <div class="value">${formatDate(election.startDate)}</div>
            <div class="label">Date</div>
          </div>
        </div>
        ${
          winner
            ? `<div class="winner-box">
          <p style="color:#059669;">🏆 ${
            election.status === "Ended" ? "Winner" : "Leading"
          }</p>
          <p style="font-size:24px;font-weight:700;">${winner.name}</p>
          <p>${
            typeof winner.votes === "number"
              ? winner.votes.toLocaleString()
              : winner.votes
          } votes (${winner.percentage})</p>
        </div>`
            : ""
        }
        <h2>Party-wise Results</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Party Name</th>
              <th>Leader</th>
              <th>Votes</th>
              <th>Share</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>${partyRows}</tbody>
        </table>
        <div style="text-align:center;margin-top:40px;border-top:2px solid #e5e7eb;padding-top:20px;">
          <p>© ${new Date().getFullYear()} Government of Nepal - Election Commission</p>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
    setExportSuccess("PDF report opened for printing/saving!");
    setTimeout(() => setExportSuccess(null), 3000);
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
        <button className="admin-button primary create-btn" onClick={() => setShowCreate(true)}>
          <i className="ri-add-line btn-icon" aria-hidden="true" />
          Create Election
        </button>
      </div>

      {exportSuccess && (
        <div className="admin-toast success">
          <i className="ri-checkbox-circle-line" aria-hidden="true" />
          {exportSuccess}
        </div>
      )}

      <div className="admin-elections__list">
        {elections.map((election) => (
          <div key={election.id} className="admin-elections__card">
            <div className="admin-elections__card-header">
              <div className="election-title-row">
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
                className="admin-button ghost btn-export"
                onClick={() => handleExport(election)}
              >
                <i className="ri-download-line icon-download" aria-hidden="true" />
                Export
              </button>
              <button
                className="admin-button ghost btn-outline"
                onClick={() => setPreview(election)}
              >
                <i className="ri-eye-line icon-eye" aria-hidden="true" />
                  Preview
                </button>
                {election.status?.toLowerCase() === "running" && (
                  <button className="admin-button primary btn-danger">
                    <i className="ri-stop-circle-line icon-stop" aria-hidden="true" />
                    Stop
                  </button>
                )}
              </div>
            </div>

            <div className="admin-elections__card-dates">
              <div className="date-item">
                <i className="ri-calendar-line icon-calendar" aria-hidden="true" />
                <span>Start: {formatDate(election.startDate)}</span>
              </div>
              <div className="date-item">
                <i className="ri-calendar-line icon-calendar" aria-hidden="true" />
                <span>End: {formatDate(election.endDate)}</span>
              </div>
            </div>

            <div className="election-divider" />

            <div className="admin-elections__stats">
              <div>
              <div className="stat-label">Total Votes</div>
                <div className="stat-number">{formatVotes(election.totalVotes)}</div>
              </div>
              <div>
                <div className="stat-label">Turnout</div>
                <div className="stat-number">{election.turnout}</div>
              </div>
              <div>
                <div className="stat-label">Auto Close</div>
                <div className="stat-number success">
                  {election.autoClose ? "Enabled" : "Disabled"}
                </div>
              </div>
              <div>
                <div className="stat-label">Auto Results</div>
                <div className="stat-number success">
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
                    className="select-input"
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
                    className="date-input"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </label>
                <label>
                  End Date & Time
                  <input
                    type="datetime-local"
                    className="date-input"
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
                  className="admin-button ghost wide"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button className="admin-button primary wide" type="submit" disabled={loading}>
                  Create Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExport && exportElection && (
        <div className="admin-modal-backdrop" onClick={() => setShowExport(false)}>
          <div className="admin-modal admin-export__modal" onClick={(e) => e.stopPropagation()}>
            <div className="export-header">
              <div className="export-title">
                <span className="export-icon">
                  <i className="ri-archive-download-line" aria-hidden="true" />
                </span>
                <div>
                  <p>Export Election Report</p>
                  <h4>{exportElection.title}</h4>
                </div>
              </div>
              <button className="preview-close" onClick={() => setShowExport(false)}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>

            <div className="export-summary-card">
              <div>
                <p className="stat-label">Status</p>
                <p className="stat-number bold">{exportElection.status}</p>
              </div>
              <div>
                <p className="stat-label">Total Votes</p>
                <p className="stat-number bold">{formatVotes(exportElection.totalVotes)}</p>
              </div>
              <div>
                <p className="stat-label">Turnout</p>
                <p className="stat-number bold">{exportElection.turnout}</p>
              </div>
              <div>
                <p className="stat-label">Parties</p>
                <p className="stat-number bold">{exportElection.parties?.length || 0}</p>
              </div>
            </div>

            <p className="export-subtitle">Choose export format:</p>
            <div className="export-actions two-col">
              <button
                className="export-card pdf"
                type="button"
                onClick={() => generatePDFReport(exportElection)}
              >
                <div className="export-card-icon">
                  <i className="ri-file-pdf-line" aria-hidden="true" />
                </div>
                <div>
                  <p className="export-card-title">PDF Report</p>
                  <p className="export-card-desc">Print-ready format</p>
                </div>
              </button>
              <button
                className="export-card csv"
                type="button"
                onClick={() => generateCSV(exportElection)}
              >
                <div className="export-card-icon">
                  <i className="ri-file-excel-line" aria-hidden="true" />
                </div>
                <div>
                  <p className="export-card-title">Excel (CSV)</p>
                  <p className="export-card-desc">Spreadsheet format</p>
                </div>
              </button>
            </div>

            <div className="export-table">
                <div className="export-table-head">
                  <i className="ri-bar-chart-line" aria-hidden="true" />
                  Party vote snapshot
                </div>
                <div className="export-table-body">
                  {(exportElection.parties || []).slice(0, 4).map((party, idx) => (
                    <div key={party.name} className="export-table-row">
                      <span className="pill-id">#{idx + 1}</span>
                      <div className="export-party-meta">
                        <p className="party-name">{party.name}</p>
                        <p className="party-leader">Leader: {party.leader}</p>
                      </div>
                      <div className="export-party-votes">
                        <span className="votes">{formatVotes(party.votes)}</span>
                        <span className="share">{party.percentage}</span>
                      </div>
                    </div>
                  ))}
                  {(exportElection.parties?.length || 0) === 0 && (
                    <p className="stat-label">No party data provided.</p>
                  )}
                </div>
              </div>

            <button className="export-close-btn" type="button" onClick={() => setShowExport(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="admin-modal-backdrop" onClick={() => setPreview(null)}>
          <div className="admin-modal admin-elections__preview" onClick={(e) => e.stopPropagation()}>
            <div className="preview-top">
              <div className="preview-title">Election Preview</div>
              <button className="preview-close" onClick={() => setPreview(null)}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
            <div className="preview-hero">
              <div className="preview-name">{preview.title}</div>
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
                <div className="stat-number">{formatVotes(preview.totalVotes)}</div>
              </div>
              <div>
                <div className="stat-label">Voter Turnout</div>
                <div className="stat-number">{preview.turnout}</div>
              </div>
            </div>
            <div className="preview-divider" />
            <div className="preview-settings-title">Election Settings</div>
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
