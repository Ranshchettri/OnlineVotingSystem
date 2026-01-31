export const saveToken = (token) => localStorage.setItem("token", token);

export const isLoggedIn = () => !!localStorage.getItem("token");

export const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};
