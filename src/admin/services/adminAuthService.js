import api from "../../services/api";

export const adminLogin = async (email, password) => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });
  return res.data;
};

export const verifyAdminOtp = async (adminId, otp) => {
  const res = await api.post("/auth/admin/verify-otp", {
    adminId,
    otp,
  });
  return res.data;
};

// Convenience wrapper used by adminLogin page
export const verifyAdminOtpWrapper = async (adminId, otp) => {
  const res = await verifyAdminOtp(adminId, otp);
  return res;
};
