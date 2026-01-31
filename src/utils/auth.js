export const getToken = () => localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("loginEmail");
  window.location.href = "/login";
};

export const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded) return false;

  const now = Date.now() / 1000;
  return decoded.exp > now;
};
