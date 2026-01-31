import api from "./api";

export const getVoteParties = () => api.get("/voter/active-parties");

export const submitVote = (data) => api.post("/votes", data);
