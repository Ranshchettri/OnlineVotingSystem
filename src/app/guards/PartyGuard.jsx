import { Navigate } from "react-router-dom";

export default function PartyGuard({ children }) {
  const role = localStorage.getItem("role");

  if (role !== "party") {
    return <Navigate to="/party/login" replace />;
  }

  return children;
}
