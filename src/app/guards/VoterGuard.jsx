import { Navigate } from "react-router-dom";

export default function VoterGuard({ children }) {
  const role = localStorage.getItem("role");

  if (role !== "voter") {
    return <Navigate to="/voter/login" replace />;
  }

  return children;
}
