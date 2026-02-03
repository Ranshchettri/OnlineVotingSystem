import Card from "../../../shared/ui/Card";

export default function PartyCard({ party, onSelect, isSelected = false }) {
  return (
    <Card
      className={`party-card ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="party-card-content">
        {party.logo && (
          <img src={party.logo} alt={party.name} className="party-logo" />
        )}
        <h3>{party.name}</h3>
        <p className="text-muted">{party.manifesto}</p>
        {party.votes && (
          <p className="party-votes">📊 {party.votes.toLocaleString()} votes</p>
        )}
      </div>
    </Card>
  );
}
