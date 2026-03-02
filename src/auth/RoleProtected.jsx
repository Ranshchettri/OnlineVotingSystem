import { Navigate, useLocation } from "react-router-dom";

const ROLE_LOGIN_ROUTE = {
  admin: "/admin/login",
  voter: "/voter/login",
  party: "/party/login",
};

const ROLE_HOME_ROUTE = {
  admin: "/admin/dashboard",
  voter: "/voter/dashboard",
  party: "/party/home",
};

const parseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const decodeJwtRole = (token = "") => {
  if (!token || !token.includes(".")) return "";
  try {
    const [, payloadPart] = token.split(".");
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return String(payload?.role || "").toLowerCase();
  } catch {
    return "";
  }
};

const resolveCurrentRole = () => {
  const token = localStorage.getItem("token");
  const tokenRole = decodeJwtRole(token || "");
  if (tokenRole) return tokenRole;

  const user = parseJson(localStorage.getItem("user"));
  if (user?.role) return String(user.role).toLowerCase();

  if (localStorage.getItem("party")) return "party";
  if (localStorage.getItem("voter")) return "voter";
  return "";
};

export default function RoleProtected({ allow, children }) {
  const location = useLocation();
  const allowedRoles = Array.isArray(allow)
    ? allow.map((r) => String(r).toLowerCase())
    : [String(allow || "").toLowerCase()];
  const token = localStorage.getItem("token");

  if (!token) {
    const loginTarget = ROLE_LOGIN_ROUTE[allowedRoles[0]] || "/";
    return (
      <Navigate
        to={loginTarget}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const currentRole = resolveCurrentRole();
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    const fallback = ROLE_HOME_ROUTE[currentRole] || "/";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

