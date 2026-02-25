import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Timeline() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/elections");
        const list = res.data?.data || res.data || [];
        const running = list.find((e) => (e.status || "").toLowerCase() === "running");
        setActive(running || list[0] || null);
      } catch {
        setActive(null);
      }
    };
    load();
  }, []);

  if (!active) return <p>Timeline data not available.</p>;

  return (
    <div className="card" style={{ padding: 20 }}>
      <h2>Election Timeline</h2>
      <p>{active.title}</p>
      <ul>
        <li>Start: {active.startDate ? new Date(active.startDate).toLocaleString() : "—"}</li>
        <li>End: {active.endDate ? new Date(active.endDate).toLocaleString() : "—"}</li>
        <li>Status: {active.status}</li>
      </ul>
    </div>
  );
}
