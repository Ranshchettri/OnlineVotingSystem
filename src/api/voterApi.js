import axios from "./axios";

export const voterLogin = (payload) => axios.post("/auth/voter-login", payload);

export const verifyVoterOTP = (payload) =>
  axios.post("/auth/voter/verify-otp", payload);

export const getVoterDashboard = () => axios.get("/voter/dashboard");

export const getAllParties = () => axios.get("/voter/parties");

export const submitVote = (payload) => axios.post("/voter/vote", payload);

export const getVoterResults = () => axios.get("/voter/results");

export const getVoterProfile = () => axios.get("/voter/profile");

export const updateVoterProfile = (payload) =>
  axios.put("/voter/profile", payload);

export const getVoterVoteHistory = () => axios.get("/voter/vote-history");
