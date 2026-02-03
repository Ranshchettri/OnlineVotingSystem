import { Routes, Route } from "react-router-dom";
import AdminLayout from "./admin/layout/AdminLayout";
import AdminLogin from "./admin/pages/adminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import CreateElection from "./admin/pages/CreateElection";
import ElectionResults from "./admin/pages/ElectionResults";
import Voters from "./admin/pages/Voters";
import Parties from "./admin/pages/Parties";
import Elections from "./admin/pages/Elections";
import Results from "./admin/pages/Results";
import Notifications from "./admin/pages/Notifications";

// Party Imports
import { useState } from "react";
import PartyLogin from "./auth/PartyLogin";
import PartyOTP from "./auth/PartyOTP";
import PartyProtectedRoute from "./auth/PartyProtectedRoute";
import PartyLayout from "./party/PartyLayout";
import PartyDashboard from "./party/Dashboard";
import PartyProfile from "./party/Profile";
import PartyAnalytics from "./party/Analytics";
import PartyResults from "./party/Results";

// Voter Imports
import VoterLayout from "./voter/VoterLayout";
import VoterLogin from "./voter/Login";
import VoterOTP from "./voter/OTP";
import VoterDashboard from "./voter/Dashboard";
import VoterParties from "./voter/Parties";
import VoterVote from "./voter/Vote";
import VoterVoteOTP from "./voter/VoteOTP";
import VoterResults from "./voter/Results";
import VoterHistory from "./voter/History";
import VoterProfile from "./voter/Profile";

export default function AppRoutes() {
  const [partyLoginEmail, setPartyLoginEmail] = useState("");
  const [showPartyOTP, setShowPartyOTP] = useState(false);

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

      {/* Party Routes */}
      <Route
        path="/party/login"
        element={
          showPartyOTP ? (
            <PartyOTP
              email={partyLoginEmail}
              onBack={() => setShowPartyOTP(false)}
            />
          ) : (
            <PartyLogin
              onNext={(email) => {
                setPartyLoginEmail(email);
                setShowPartyOTP(true);
              }}
            />
          )
        }
      />

      <Route
        path="/party/*"
        element={
          <PartyLayout>
            <Routes>
              <Route path="dashboard" element={<PartyDashboard />} />
              <Route path="profile" element={<PartyProfile />} />
              <Route path="analytics" element={<PartyAnalytics />} />
              <Route path="results" element={<PartyResults />} />
            </Routes>
          </PartyLayout>
        }
      />

      {/* Voter Routes */}
      <Route path="/voter/login" element={<VoterLogin />} />
      <Route path="/voter/otp" element={<VoterOTP />} />

      <Route
        path="/voter/*"
        element={
          <VoterLayout>
            <Routes>
              <Route path="dashboard" element={<VoterDashboard />} />
              <Route path="parties" element={<VoterParties />} />
              <Route path="vote" element={<VoterVote />} />
              <Route path="vote-otp" element={<VoterVoteOTP />} />
              <Route path="results" element={<VoterResults />} />
              <Route path="history" element={<VoterHistory />} />
              <Route path="profile" element={<VoterProfile />} />
            </Routes>
          </VoterLayout>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<AdminLogin />} />
    </Routes>
  );
}
