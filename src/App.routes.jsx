import { Routes, Route } from "react-router-dom";
import AdminLayout from "./admin/layout/AdminLayout";
import AdminLogin from "./admin/pages/adminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import Voters from "./admin/pages/Voters";
import Parties from "./admin/pages/Parties";
import Elections from "./admin/pages/Elections";
import Results from "./admin/pages/Results";
import Notifications from "./admin/pages/Notifications";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="voters" element={<Voters />} />
              <Route path="parties" element={<Parties />} />
              <Route path="elections" element={<Elections />} />
              <Route path="results" element={<Results />} />
              <Route path="notifications" element={<Notifications />} />
            </Routes>
          </AdminLayout>
        }
      />

      <Route path="/" element={<AdminLogin />} />
    </Routes>
  );
}
