import { partyProfileData } from "../services/partyFakeData";

export default function PartyProfile() {
  return (
    <div>
      <h2>Party Profile</h2>

      <p>{partyProfileData.description}</p>

      <h3>Manifesto</h3>
      <ul>
        {partyProfileData.manifesto.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>

      <p className="note">⚠ Core details controlled by Election Commission</p>
    </div>
  );
}
