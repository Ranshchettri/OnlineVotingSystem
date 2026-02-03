import api from "./axios";

export const partyLogin = (email) => api.post("/auth/party-login", { email });

export const verifyPartyOTP = (data) =>
  api.post("/auth/party/verify-otp", data);

export const getPartyDashboard = () => api.get("/party/dashboard");

export const updatePartyProfile = (data) => api.put("/party/profile", data);

export const getPartyAnalytics = () => api.get("/party/analytics");

export const getPartyResults = () => api.get("/party/results");

export default {
  partyLogin,
  verifyPartyOTP,
  getPartyDashboard,
  updatePartyProfile,
  getPartyAnalytics,
  getPartyResults,
};
