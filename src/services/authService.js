import api from "./api";

export const loginAdmin = async (data) => {
  const res = await api.post("/auth/login", data);

  if (res.data.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
};
