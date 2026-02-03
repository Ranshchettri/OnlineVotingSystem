import { parties } from "../mock/voter.mock";
import Card from "../../../shared/ui/Card";
import ResultRow from "../components/ResultRow";

export default function Results() {
  const sorted = [...parties].sort((a, b) => b.votes - a.votes);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Election Results</h1>
        <p>Live rankings</p>
      </div>

      <Card className="results-card">
        <div className="results-list">
          {sorted.map((p, idx) => (
            <ResultRow key={p.id} rank={idx + 1} party={p} />
          ))}
        </div>
      </Card>
    </div>
  );
}
