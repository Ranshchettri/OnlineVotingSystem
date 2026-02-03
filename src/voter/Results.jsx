import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Results() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get active/ended election first
    axios
      .get("/elections/active-ended")
      .then((res) => {
        if (!res.data?._id) {
          setResult(null);
          setLoading(false);
          return;
        }
        // Then get voter-specific results for that election
        return axios.get(`/api/results/voter/${res.data._id}`);
      })
      .then((res) => res && setResult(res.data?.data || res.data))
      .catch((err) => {
        console.error("Failed to fetch results:", err);
        setResult(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading results...</p>;
  if (!result) return <p className="error">Results not published yet</p>;

  const resultArray = Array.isArray(result.results) ? result.results : [];
  const winners = result.winnerIds || [];

  return (
    <div>
      <h2>Election Results</h2>
      <h3>{result.electionTitle || "Current Election"}</h3>

      <div className="grid">
        {resultArray.length > 0 ? (
          resultArray.map((r) => (
            <div
              key={r.candidateId || r._id}
              className={`card ${winners.includes(r.candidateId) ? "winner" : ""}`}
            >
              {r.logo && <img src={r.logo} width="60" alt={r.name} />}
              <h4>{r.name || r.partyName}</h4>
              <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {r.totalVotes || 0} votes
              </p>
            </div>
          ))
        ) : (
          <p>No results yet</p>
        )}
      </div>

      {winners.length > 1 && (
        <p style={{ marginTop: "1rem", color: "#ea580c" }}>
          ⚠ Tie detected — multiple winners
        </p>
      )}
    </div>
  );
}
