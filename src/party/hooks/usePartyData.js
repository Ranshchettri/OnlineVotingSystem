import { useEffect, useState } from "react";
import api from "../../services/api";

export function usePartyData() {
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/parties");
        const list = res.data?.data || res.data || [];
        setParty(list[0] || null);
      } catch (err) {
        console.error("Failed to load party data", err.message);
        setParty(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { party, loading };
}
