import api from "./api";

// User Login
export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
};

// Admin Login (Step 1: Send email + password, receives OTP requirement)
export const loginAdmin = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });

  // Check if OTP is required (for ADMIN)
  if (res.data.otpRequired) {
    return res.data; // Return with otpRequired flag
  }

  // If voter - direct login with token
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
};

// Admin OTP Verification (Step 2: Verify OTP, get JWT)
export const verifyAdminOtp = async (adminId, otp) => {
  const res = await api.post("/auth/admin/verify-otp", { adminId, otp });

  // Store token and user
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  localStorage.setItem("role", "ADMIN");

  return res.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  window.location.href = "/";
};

// Get Current User
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

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
