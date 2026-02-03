import Card from "../../../shared/ui/Card";

export default function ElectionCard({ election }) {
  const endsAt = new Date(election.endsAt);
  const now = new Date();
  const daysLeft = Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24));

  return (
    <Card className="election-card">
      <h2>{election.title}</h2>
      <div className="election-meta">
        <p>
          🗳️ <strong>Ends:</strong> {endsAt.toLocaleDateString()}
        </p>
        <p className={daysLeft > 0 ? "text-warning" : "text-danger"}>
          ⏱️{" "}
          <strong>
            {daysLeft > 0 ? `${daysLeft} days left` : "Voting ended"}
          </strong>
        </p>
      </div>
    </Card>
  );
}
