import "../styles/parties.css";

const PartyCard = ({ party, onToggle, onDelete }) => {
  return (
    <div className={`party-card ${party.isActive ? "active" : "inactive"}`}>
      <h3>{party.name}</h3>
      <p>{party.symbol || "No symbol"}</p>
      <div className="party-card-actions">
        <button
          className="party-card-actions button"
          onClick={() => onToggle(party._id)}
          title={party.isActive ? "Deactivate Party" : "Activate Party"}
        >
          {party.isActive ? "Deactivate" : "Activate"}
        </button>
        <button
          className="btn-delete-party"
          onClick={() => onDelete(party._id)}
          title="Delete Party"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default PartyCard;
