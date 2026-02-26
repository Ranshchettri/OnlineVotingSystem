import api from "./api";

// Party admin endpoints
export const getPartyProfile = () => api.get("/parties/profile");

export const updatePartyInfo = (data) => api.put("/parties/profile", data);

export const getPartyVotes = () => api.get("/parties/results");

// Voter endpoints - view party details by ID
export const getPartyDetails = (partyId) => api.get(`/parties/${partyId}`);

export const getPartyStats = (partyId) => api.get(`/parties/${partyId}/stats`);
