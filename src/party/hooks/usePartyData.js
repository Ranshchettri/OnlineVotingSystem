import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const getSessionParty = () => {
  try {
    return JSON.parse(localStorage.getItem("party") || "{}");
  } catch {
    return {};
  }
};

const extractPartyFromResponse = (payload) =>
  payload?.data?.party || payload?.party || payload || null;

export function usePartyData() {
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sessionParty = getSessionParty();
      const fallbackEmail = normalizeEmail(sessionParty.email);
      let partyId = sessionParty.partyId || sessionParty.id || "";

      if (!partyId) {
        const meRes = await api.get("/auth/me");
        const me = meRes.data?.data || {};
        partyId = me.partyId || "";
      }

      if (partyId) {
        const partyRes = await api.get(`/parties/${partyId}`);
        const parsed = extractPartyFromResponse(partyRes.data);
        setParty(parsed);
        return;
      }

      const allPartiesRes = await api.get("/parties");
      const allParties =
        allPartiesRes.data?.data?.parties ||
        allPartiesRes.data?.data ||
        allPartiesRes.data ||
        [];
      const list = Array.isArray(allParties) ? allParties : [];

      if (!fallbackEmail) {
        setParty(list[0] || null);
        return;
      }

      const matched = list.find(
        (item) => normalizeEmail(item?.email) === fallbackEmail,
      );
      setParty(matched || list[0] || null);
    } catch (err) {
      console.error("Failed to load party data", err?.message || err);
      setParty(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  return { party, loading, refreshParty: load };
}

