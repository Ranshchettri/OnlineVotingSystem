import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../admin/layout/AdminLayout";
import AdminLogin from "../admin/pages/adminLogin";
import AdminDashboard from "../admin/pages/AdminDashboard";
import CreateElection from "../admin/pages/CreateElection";
import ElectionResults from "../admin/pages/ElectionResults";
import Voters from "../admin/pages/Voters";
import Parties from "../admin/pages/Parties";
import Elections from "../admin/pages/Elections";
import Results from "../admin/pages/Results";
import Notifications from "../admin/pages/Notifications";
import VoterLayout from "../voter/layout/VoterLayout";
import Overview from "../voter/pages/Overview";
import Profile from "../voter/pages/Profile";
import Timeline from "../voter/pages/Timeline";
import VoterResults from "../voter/pages/Results";
import Rules from "../voter/pages/Rules";
import PartyProfile from "../voter/pages/PartyProfile";

export default function AppRouter() {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="elections/create" element={<CreateElection />} />
              <Route
                path="elections/results/:electionId"
                element={<ElectionResults />}
              />
              <Route path="voters" element={<Voters />} />
              <Route path="parties" element={<Parties />} />
              <Route path="elections" element={<Elections />} />
              <Route path="results" element={<Results />} />
              <Route path="notifications" element={<Notifications />} />
            </Routes>
          </AdminLayout>
        }
      />

      {/* Voter Routes */}
      <Route path="/voter" element={<VoterLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Overview />} />
        <Route path="party/:partyId" element={<PartyProfile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="results" element={<VoterResults />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="rules" element={<Rules />} />
      </Route>

      {/* Default Route */}
      <Route path="/" element={<AdminLogin />} />
    </Routes>
  );
}
