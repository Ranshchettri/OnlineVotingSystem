import api from "./api";

export const getDashboardStats = () => api.get("/admin/dashboard");

export const createElection = (data) => api.post("/admin/election", data);

export const activateParty = (id) => api.patch(`/admin/party/${id}/activate`);

export const approveVoter = (id) => api.patch(`/admin/voter/${id}/approve`);
