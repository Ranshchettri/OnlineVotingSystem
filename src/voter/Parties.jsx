import { useEffect, useState } from "react";
import { getAllParties } from "../api/voterApi";

export default function Parties() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getAllParties()
      .then((res) => {
        const data = res.data?.data || res.data;
        setParties(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch parties:", err);
        setParties([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = parties.filter((p) =>
    p.name?.toLowerCase().includes(filter.toLowerCase()),
  );

  if (loading) return <p className="loading">Loading parties...</p>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search parties..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="search-input"
        style={{ marginBottom: "1rem" }}
      />

      <div className="grid">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <div key={p._id} className="card">
              {p.logo && (
                <img
                  src={p.logo}
                  alt={p.name}
                  style={{ width: "60px", marginBottom: "0.5rem" }}
                />
              )}
              <h3>{p.name}</h3>
              <p>{p.manifesto || "No description"}</p>
              {p.votes && <p className="votes-count">📊 {p.votes} votes</p>}
            </div>
          ))
        ) : (
          <p>No parties found</p>
        )}
      </div>
    </div>
  );
}
