import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Results() {
  const [ended, setEnded] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/elections");
        const list = res.data?.data || res.data || [];
        setEnded(list.filter((e) => (e.status || "").toLowerCase() === "ended"));
      } catch {
        setEnded([]);
      }
    };
    load();
  }, []);

  return (
    <div className="card" style={{ padding: 20 }}>
      <h2>Election Results</h2>
      {ended.length === 0 ? <p>No ended elections yet.</p> : null}
      <div className="overview-party-list">
        {ended.map((e) => (
          <div key={e.id || e._id} className="party-card">
            <div className="party-content">
              <div className="party-header">
                <div>
                  <p className="party-name">{e.title}</p>
                  <p className="party-leader">{e.type}</p>
                </div>
                <span className="party-view-btn">Ended</span>
              </div>
              <div className="party-meta">
                <div>
                  <span>Total Votes</span>
                  <strong>{e.totalVotes?.toLocaleString?.() || e.totalVotes || "0"}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{e.status}</strong>
                </div>
                <div>
                  <span>Turnout</span>
                  <strong>{e.turnout || "—"}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
