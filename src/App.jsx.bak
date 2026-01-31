import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./admin/pages/adminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
