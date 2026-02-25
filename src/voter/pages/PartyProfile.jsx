import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

export default function PartyProfile() {
  const { partyId } = useParams();
  const [party, setParty] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/parties");
        const list = res.data?.data || res.data || [];
        const found = list.find((p) => p._id === partyId || p.id === partyId) || list[0];
        setParty(found || null);
      } catch {
        setParty(null);
      }
    };
    load();
  }, [partyId]);

  if (!party) return <p>Party not found.</p>;

  return (
    <div className="card" style={{ padding: 20 }}>
      <h2>{party.name}</h2>
      <p>Leader: {party.leader}</p>
      <p>Vision: {party.vision || "—"}</p>
      <p>Total Votes: {party.totalVotes?.toLocaleString?.() || party.totalVotes || "—"}</p>
    </div>
  );
}
