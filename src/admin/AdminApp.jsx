import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";
import { isLoggedIn } from "../hooks/useAuth";

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route
        path="/dashboard"
        element={isLoggedIn() ? <Dashboard /> : <Navigate to="/" />}
      />
    </Routes>
  );
}
