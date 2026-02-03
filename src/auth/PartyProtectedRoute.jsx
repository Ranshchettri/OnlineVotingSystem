import { Navigate } from "react-router-dom";

export default function PartyProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/party/login" replace />;
  }

  return children;
}
