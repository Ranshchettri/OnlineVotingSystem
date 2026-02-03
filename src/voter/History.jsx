import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/voter/history")
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch history:", err);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading history...</p>;
  if (!history.length) return <p className="error">No voting history</p>;

  return (
    <div>
      <h2>Your Voting History</h2>

      {history.map((h) => (
        <div
          key={h.electionId || h._id}
          className="card"
          style={{ marginBottom: "1rem" }}
        >
          <h4>{h.electionTitle || "Election"}</h4>
          <p>
            <strong>Year:</strong> {h.year || new Date(h.votedAt).getFullYear()}
          </p>
          <p>
            <strong>You voted for:</strong> {h.partyName || "N/A"}
          </p>
          <p>
            <strong>Result:</strong>{" "}
            {h.winnerParty === h.partyName ? "🏆 Winner" : "Lost"}
          </p>
        </div>
      ))}
    </div>
  );
}
