import api from "./api";

export const adminLogin = (data) =>
  api.post("/auth/login", data);

export const verifyAdminOTP = (data) =>
  api.post("/auth/verify-otp", data);

// Check if User is Admin
export const isAdmin = () => {
  return localStorage.getItem("role") === "ADMIN";
};

// Check if Authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Verify Token
export const verifyToken = async () => {
  try {
    const res = await api.post("/auth/verify");
    return res.data;
  } catch (error) {
    logout();
    throw error;
  }
};

export const verifyVoteOtp = (data) => api.post("/auth/verify-vote-otp", data);
