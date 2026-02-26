import api from "./axios";

export const partyLogin = (email) => api.post("/auth/party-login", { email });

export const verifyPartyOTP = (data) =>
  api.post("/auth/party/verify-otp", data);

export const getPartyDashboard = () => api.get("/parties/dashboard");

export const updatePartyProfile = (data) => api.put("/parties/profile", data);

export const getPartyAnalytics = () => api.get("/parties/analytics");

export const getPartyResults = () => api.get("/parties/results");

export default {
  partyLogin,
  verifyPartyOTP,
  getPartyDashboard,
  updatePartyProfile,
  getPartyAnalytics,
  getPartyResults,
};
