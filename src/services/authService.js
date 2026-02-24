import api from "./api";

export const loginAdmin = async (data) => {
  const res = await api.post("/auth/login", data);
  // Admin login may return otpRequired instead of token
  const role = res.data?.user?.role || res.data?.role;
  if (role && role.toLowerCase() !== "admin") {
    throw new Error("Not authorized");
  }

  if (res.data?.otpRequired) {
    return res.data; // { otpRequired: true, adminId, otp? }
  }

  if (res.data?.token) {
    localStorage.setItem("token", res.data.token);
    if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res.data;
};
