import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://ovs-backend-b7xo.onrender.com/api");

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const isNetwork = error.code === "ERR_NETWORK" || !error.response;
    const isUnauthorized = status === 401;
    // Keep console noise minimal but still helpful
    if (isNetwork) {
      console.warn("API offline or unreachable:", error.message);
    } else {
      console.error("API Error:", status, data);
    }
    // Attach a friendly flag the UI can read
    error.isNetworkError = isNetwork;
    error.isUnauthorized = isUnauthorized;

    // If admin pages hit 401, force re-login
    if (isUnauthorized && typeof window !== "undefined") {
      const path = window.location.pathname || "";
      if (path.startsWith("/admin")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
