import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import emblem from "../assets/nepal-emblem.svg";
import FaceVerifyModal from "../voter/components/FaceVerifyModal";
import "../styles/portal-login.css";

const ROLES = ["voter", "admin", "party"];

export default function PortalLogin({ initialRole = "voter" }) {
  const navigate = useNavigate();
  const safeRole = ROLES.includes(initialRole) ? initialRole : "voter";
  const [role, setRole] = useState(safeRole);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [voterStep, setVoterStep] = useState("login");
  const [voterForm, setVoterForm] = useState({ email: "", voterId: "" });
  const [voterOtp, setVoterOtp] = useState("123456");
  const [voterDbId, setVoterDbId] = useState("");
  const [faceVerified, setFaceVerified] = useState(false);

  const [adminStep, setAdminStep] = useState("login");
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });
  const [adminOtp, setAdminOtp] = useState("999999");
  const [adminId, setAdminId] = useState("");

  const [partyStep, setPartyStep] = useState("login");
  const [partyEmail, setPartyEmail] = useState("");
  const [partyOtp, setPartyOtp] = useState("54321");

  const roleHeading = useMemo(() => {
    if (role === "admin") return "Admin Login";
    if (role === "party") return "Party Login";
    return "Voter Login";
  }, [role]);

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setStatus("");
  };

  const handleVoterLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await api.post("/auth/voter/login", {
        email: voterForm.email,
        voterId: voterForm.voterId,
      });
      setVoterOtp(response.data?.otp || "123456");
      setVoterDbId(response.data?.voterId || "");
      setVoterStep("face");
      setStatus("Face verification required.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Voter login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoterVerifyOtp = async (event) => {
    event.preventDefault();
    if (!faceVerified) {
      setStatus("Complete face verification first.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await api.post("/auth/voter/verify-otp", {
        voterId: voterDbId,
        otp: voterOtp,
      });
      localStorage.setItem("token", response.data?.token || "");
      if (response.data?.user) {
        localStorage.setItem("voter", JSON.stringify(response.data.user));
      }
      navigate("/voter/dashboard");
    } catch (error) {
      setStatus(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await api.post("/auth/login", {
        email: adminForm.email,
        password: adminForm.password,
      });

      if (!response.data?.otpRequired) {
        setStatus("Admin OTP flow not started. Check admin credentials.");
        return;
      }
      setAdminId(response.data?.adminId || "");
      setAdminOtp(response.data?.otp || "999999");
      setAdminStep("otp");
      setStatus("Admin OTP generated.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Admin login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await api.post("/auth/admin/verify-otp", {
        adminId,
        otp: adminOtp,
      });
      localStorage.setItem("token", response.data?.token || "");
      if (response.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      navigate("/admin/dashboard");
    } catch (error) {
      setStatus(error.response?.data?.message || "Admin OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePartyLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const normalizedEmail = String(partyEmail || "").trim().toLowerCase();
      const response = await api.post("/auth/party-login", { email: normalizedEmail });
      setPartyEmail(normalizedEmail);
      setPartyOtp(response.data?.otp || "54321");
      setPartyStep("otp");
      setStatus("Party OTP generated.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Party login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePartyVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await api.post("/auth/party/verify-otp", {
        email: partyEmail,
        otp: partyOtp,
      });
      localStorage.setItem("token", response.data?.token || "");
      if (response.data?.user) {
        localStorage.setItem("party", JSON.stringify(response.data.user));
      }
      navigate("/party/home");
    } catch (error) {
      setStatus(error.response?.data?.message || "Party OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-login-shell">
      <div className="portal-login-card">
        <div className="portal-login-left">
          <div className="portal-login-left-overlay" />
          <div className="portal-login-brand">
            <img src={emblem} alt="Nepal emblem" />
            <div>
              <h2>Nepal OVS</h2>
              <p>Election Commission</p>
            </div>
          </div>
          <div className="portal-login-copy">
            <span className="portal-badge">Election Active System</span>
            <h1>Your Vote. Your Voice.</h1>
            <p>Secure digital voting for Nepal.</p>
          </div>
        </div>

        <div className="portal-login-right">
          <div className="portal-role-tabs">
            <button
              type="button"
              className={role === "voter" ? "active" : ""}
              onClick={() => switchRole("voter")}
            >
              V
            </button>
            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => switchRole("admin")}
            >
              A
            </button>
            <button
              type="button"
              className={role === "party" ? "active" : ""}
              onClick={() => switchRole("party")}
            >
              P
            </button>
          </div>

          <h3>{roleHeading}</h3>
          {status ? <div className="portal-login-status">{status}</div> : null}

          {role === "voter" && voterStep === "login" ? (
            <form className="portal-login-form" onSubmit={handleVoterLogin}>
              <label>
                Email
                <input
                  type="email"
                  value={voterForm.email}
                  onChange={(e) => setVoterForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>
              <label>
                Voter ID
                <input
                  type="text"
                  value={voterForm.voterId}
                  onChange={(e) => setVoterForm((prev) => ({ ...prev, voterId: e.target.value }))}
                  required
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Checking..." : "Continue to Face Verification"}
              </button>
            </form>
          ) : null}

          {role === "voter" && voterStep === "otp" ? (
            <form className="portal-login-form" onSubmit={handleVoterVerifyOtp}>
              <label>
                OTP
                <input
                  type="text"
                  value={voterOtp}
                  onChange={(e) => setVoterOtp(e.target.value)}
                  required
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Enter"}
              </button>
            </form>
          ) : null}

          {role === "admin" && adminStep === "login" ? (
            <form className="portal-login-form" onSubmit={handleAdminLogin}>
              <label>
                Admin Email
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Checking..." : "Continue to OTP"}
              </button>
            </form>
          ) : null}

          {role === "admin" && adminStep === "otp" ? (
            <form className="portal-login-form" onSubmit={handleAdminVerifyOtp}>
              <label>
                OTP
                <input
                  type="text"
                  value={adminOtp}
                  onChange={(e) => setAdminOtp(e.target.value)}
                  required
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Enter Admin"}
              </button>
            </form>
          ) : null}

          {role === "party" && partyStep === "login" ? (
            <form className="portal-login-form" onSubmit={handlePartyLogin}>
              <label>
                Party Email
                <input
                  type="email"
                  value={partyEmail}
                  onChange={(e) => setPartyEmail(e.target.value)}
                  required
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Get OTP"}
              </button>
            </form>
          ) : null}

          {role === "party" && partyStep === "otp" ? (
            <form className="portal-login-form" onSubmit={handlePartyVerifyOtp}>
              <label>
                OTP
                <input
                  type="text"
                  value={partyOtp}
                  onChange={(e) => setPartyOtp(e.target.value)}
                  required
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Enter Party"}
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <FaceVerifyModal
        isOpen={role === "voter" && voterStep === "face"}
        party={null}
        onClose={() => setVoterStep("login")}
        onVerified={() => {
          setFaceVerified(true);
          setVoterStep("otp");
          setStatus("Face verified. Please enter OTP.");
        }}
      />
    </div>
  );
}
