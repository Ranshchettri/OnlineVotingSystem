import api from "./api";
import { logout } from "../hooks/useAuth";

export const adminLogin = (data) => api.post("/auth/login", data);

export const verifyAdminOTP = (data) => api.post("/auth/verify-otp", data);

// Verify Token with backend
export const verifyToken = async () => {
  try {
    const res = await api.post("/auth/verify");
    return res.data;
  } catch (error) {
    logout();
    throw error;
  }
};
