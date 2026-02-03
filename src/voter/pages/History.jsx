import { useState, useEffect } from "react";
import TimelineItem from "../components/TimelineItem";
import { getVoterVoteHistory } from "../../services/voterService";

export default function History() {
  const [voteHistory, setVoteHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getVoterVoteHistory();
        setVoteHistory(res.data?.history || []);
      } catch (err) {
        console.error("Failed to fetch vote history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
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
        <h1>Your Voting History</h1>
        <p>Past elections and choices</p>
      </div>

      <div className="timeline">
        {voteHistory.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </div>

      {voteHistory.length === 0 && (
        <p className="text-muted">No voting history yet</p>
      )}
    </div>
  );
}
