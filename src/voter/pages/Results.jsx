import { useState, useEffect } from "react";
import Card from "../../shared/ui/Card";
import ResultRow from "../components/ResultRow";
import { getVoterResults } from "../../services/voterService";

export default function Results() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getVoterResults();
        const data = res.data?.parties || [];
        setParties([...data].sort((a, b) => b.votes - a.votes));
      } catch (err) {
        console.error("Failed to fetch results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading)
    return (
      <div className="page-content">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Election Results</h1>
        <p>Live rankings</p>
      </div>

      <Card className="results-card">
        <div className="results-list">
          {parties.map((p, idx) => (
            <ResultRow key={p.id} rank={idx + 1} party={p} />
          ))}
        </div>
      </Card>
    </div>
  );
}
