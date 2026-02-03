import Badge from "../../../shared/ui/Badge";

export default function ResultRow({ rank, party }) {
  const isWinner = rank === 1;

  return (
    <div className="result-row">
      <div className="result-rank">{isWinner ? "🏆" : `#${rank}`}</div>
      <div className="result-party">
        {party.logo && <img src={party.logo} alt={party.name} />}
        <div>
          <h4>{party.name}</h4>
        </div>
      </div>
      <div className="result-votes">
        <Badge variant={isWinner ? "success" : "default"}>
          {party.votes.toLocaleString()} votes
        </Badge>
      </div>
    </div>
  );
}
