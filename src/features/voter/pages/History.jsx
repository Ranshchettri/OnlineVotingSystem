import { voteHistory } from "../mock/voter.mock";
import TimelineItem from "../components/TimelineItem";

export default function History() {
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
