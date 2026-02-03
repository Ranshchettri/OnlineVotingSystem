import { Navigate } from "react-router-dom";

export default function VoterProtected({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/voter/login" replace />;
  }

  return children;
}
