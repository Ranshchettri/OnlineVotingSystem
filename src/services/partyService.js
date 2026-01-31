import api from "./api";

// Party admin endpoints
export const getPartyProfile = () => api.get("/party/profile");

export const updatePartyInfo = (data) => api.put("/party/profile", data);

export const getPartyVotes = () => api.get("/party/votes");

// Voter endpoints - view party details by ID
export const getPartyDetails = (partyId) => api.get(`/parties/${partyId}`);

export const getPartyStats = (partyId) => api.get(`/parties/${partyId}/stats`);
