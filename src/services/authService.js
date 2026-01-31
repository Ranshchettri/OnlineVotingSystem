import api from "./api";
import { logout } from "../hooks/useAuth";

const LOGIN_ENDPOINT = import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || "/auth/login";
const VERIFY_OTP_ENDPOINT = import.meta.env.VITE_AUTH_VERIFY_OTP_ENDPOINT || "/auth/verify-otp";

export const adminLogin = (data) => api.post(LOGIN_ENDPOINT, data);

export const verifyAdminOTP = (data) => api.post(VERIFY_OTP_ENDPOINT, data);

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
