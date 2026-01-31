import api from "./api";

export const getVoterDashboard = () => api.get("/voter/dashboard");

export const getVoterProfile = () => api.get("/voter/profile");

export const getActiveParties = () => api.get("/voter/parties");

export const castVote = (data) => api.post("/voter/vote", data);

export const getElectionResults = () => api.get("/voter/election-results");
