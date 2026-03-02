import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import emblem from "../assets/nepal-emblem.svg";
import FaceVerifyModal from "../voter/components/FaceVerifyModal";
import "../styles/portal-login.css";

const ROLE_TABS = [
  { key: "voter", label: "Voter" },
  { key: "admin", label: "Admin" },
  { key: "party", label: "Party" },
];
const DEFAULT_ADMIN_EMAIL = "ranshchettri788@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@123456";

export default function PortalLogin({ initialRole = "voter" }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(
    ROLE_TABS.some((tab) => tab.key === initialRole) ? initialRole : "voter",
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [voterStep, setVoterStep] = useState("login");
  const [voterForm, setVoterForm] = useState({ email: "", voterId: "" });
  const [voterOtp, setVoterOtp] = useState("123456");
  const [voterDbId, setVoterDbId] = useState("");
  const [faceVerified, setFaceVerified] = useState(false);

  const [adminStep, setAdminStep] = useState("login");
  const [adminForm, setAdminForm] = useState({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  });
  const [adminOtp, setAdminOtp] = useState("999999");
  const [adminId, setAdminId] = useState("");

  const [partyStep, setPartyStep] = useState("login");
  const [partyEmail, setPartyEmail] = useState("");
  const [partyOtp, setPartyOtp] = useState("54321");

  const heading = useMemo(() => {
    if (role === "admin") return "Admin Login";
    if (role === "party") return "Party Login";
    return "Voter Login";
  }, [role]);

  const subtitle = useMemo(() => {
    if (role === "admin") return "Enter your admin credentials to access control panel";
    if (role === "party") return "Enter official party email and OTP verification";
    return "Enter your credentials to access the voting portal";
  }, [role]);

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
      const normalizedEmail = String(adminForm.email || "").trim().toLowerCase();
      const response = await api.post("/auth/login", {
        email: normalizedEmail,
        password: adminForm.password,
      });

      if (!response.data?.otpRequired) {
        setStatus("Admin OTP flow not started. Check credentials.");
        return;
      }
      setAdminId(response.data?.adminId || "");
      setAdminOtp(response.data?.otp || "999999");
      setAdminStep("otp");
      setStatus("OTP sent. Enter OTP to continue.");
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
      setStatus("OTP sent to party account.");
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

  const renderVoter = () => {
    if (voterStep === "otp") {
      return (
        <form className="portal-form" onSubmit={handleVoterVerifyOtp}>
          <label>OTP</label>
          <div className="portal-input-wrap">
            <i className="ri-shield-keyhole-line" aria-hidden="true" />
            <input
              type="text"
              value={voterOtp}
              onChange={(e) => setVoterOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
          </div>
          <button type="submit" className="portal-primary-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Enter Dashboard"}
          </button>
        </form>
      );
    }

    return (
      <form className="portal-form" onSubmit={handleVoterLogin}>
        <label>Email or Mobile Number</label>
        <div className="portal-input-wrap">
          <i className="ri-mail-line" aria-hidden="true" />
          <input
            type="text"
            value={voterForm.email}
            onChange={(e) => setVoterForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="voter@example.com or 9841234567"
            required
          />
        </div>

        <label>Voter ID</label>
        <div className="portal-input-wrap">
          <i className="ri-id-card-line" aria-hidden="true" />
          <input
            type="text"
            value={voterForm.voterId}
            onChange={(e) => setVoterForm((prev) => ({ ...prev, voterId: e.target.value }))}
            placeholder="NP2025001"
            required
          />
        </div>
        <p className="portal-help">Format: NP followed by digits</p>

        <div className="portal-alert">
          <i className="ri-camera-line" aria-hidden="true" />
          <div>
            <strong>Face Verification Required</strong>
            <p>Camera access needed for identity verification in the next step.</p>
          </div>
        </div>

        <button type="submit" className="portal-primary-btn" disabled={loading}>
          {loading ? "Checking..." : "Continue to Face Verification"}
          <i className="ri-arrow-right-line" aria-hidden="true" />
        </button>

        <div className="portal-demo">
          <strong>Demo Credentials</strong>
          <p>
            Email: voter@example.com &nbsp;&nbsp; ID: NP2025001
          </p>
        </div>
      </form>
    );
  };

  const renderAdmin = () => {
    if (adminStep === "otp") {
      return (
        <form className="portal-form" onSubmit={handleAdminVerifyOtp}>
          <label>Admin OTP</label>
          <div className="portal-input-wrap">
            <i className="ri-shield-keyhole-line" aria-hidden="true" />
            <input
              type="text"
              value={adminOtp}
              onChange={(e) => setAdminOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
          </div>
          <button type="submit" className="portal-primary-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Enter Admin"}
          </button>
        </form>
      );
    }

    return (
      <form className="portal-form" onSubmit={handleAdminLogin}>
        <label>Admin Email</label>
        <div className="portal-input-wrap">
          <i className="ri-user-line" aria-hidden="true" />
          <input
            type="email"
            value={adminForm.email}
            onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder={DEFAULT_ADMIN_EMAIL}
            required
          />
        </div>

        <label>Password</label>
        <div className="portal-input-wrap">
          <i className="ri-lock-line" aria-hidden="true" />
          <input
            type="password"
            value={adminForm.password}
            onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder={DEFAULT_ADMIN_PASSWORD}
            required
          />
        </div>

        <button type="submit" className="portal-primary-btn" disabled={loading}>
          {loading ? "Checking..." : "Continue to OTP"}
        </button>
      </form>
    );
  };

  const renderParty = () => {
    if (partyStep === "otp") {
      return (
        <form className="portal-form" onSubmit={handlePartyVerifyOtp}>
          <label>Party OTP</label>
          <div className="portal-input-wrap">
            <i className="ri-shield-keyhole-line" aria-hidden="true" />
            <input
              type="text"
              value={partyOtp}
              onChange={(e) => setPartyOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
          </div>
          <button type="submit" className="portal-primary-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Enter Party Portal"}
          </button>
        </form>
      );
    }

    return (
      <form className="portal-form" onSubmit={handlePartyLogin}>
        <label>Official Party Email</label>
        <div className="portal-input-wrap">
          <i className="ri-mail-line" aria-hidden="true" />
          <input
            type="email"
            value={partyEmail}
            onChange={(e) => setPartyEmail(e.target.value)}
            placeholder="party@ovs.gov.np"
            required
          />
        </div>

        <button type="submit" className="portal-primary-btn" disabled={loading}>
          {loading ? "Sending..." : "Get OTP"}
        </button>
      </form>
    );
  };

  return (
    <div className="portal-login-shell">
      <div className="portal-login-card">
        <section className="portal-login-left">
          <div className="portal-login-left-overlay" />
          <div className="portal-login-brand">
            <img src={emblem} alt="Nepal emblem" />
            <div>
              <h2>Nepal OVS</h2>
              <p>Online Voting System</p>
            </div>
          </div>

          <div className="portal-login-copy">
            <span className="portal-badge">Election Active - National 2025</span>
            <h1>
              Your Vote,
              <br />
              Your Voice,
              <br />
              <span>Your Nepal.</span>
            </h1>
            <p>Participate in the democratic process securely.</p>
          </div>

          <div className="portal-features">
            <article>
              <i className="ri-shield-check-line" aria-hidden="true" />
              <strong>Secure</strong>
              <p>End-to-end encrypted</p>
            </article>
            <article>
              <i className="ri-checkbox-circle-line" aria-hidden="true" />
              <strong>Verified</strong>
              <p>Face recognition</p>
            </article>
            <article>
              <i className="ri-lock-line" aria-hidden="true" />
              <strong>Private</strong>
              <p>Anonymous voting</p>
            </article>
          </div>
        </section>

        <section className="portal-login-right">
          <div className="portal-role-tabs">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={role === tab.key ? "active" : ""}
                onClick={() => {
                  setRole(tab.key);
                  setStatus("");
                  if (tab.key === "admin") {
                    // Always prefill admin credentials on tab switch as requested.
                    setAdminForm({
                      email: DEFAULT_ADMIN_EMAIL,
                      password: DEFAULT_ADMIN_PASSWORD,
                    });
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h3>{heading}</h3>
          <p className="portal-subtitle">{subtitle}</p>

          {status ? <div className="portal-login-status">{status}</div> : null}
          {role === "voter" ? renderVoter() : null}
          {role === "admin" ? renderAdmin() : null}
          {role === "party" ? renderParty() : null}
          <p className="portal-bottom-note">
            Protected by 256-bit encryption & biometric verification
          </p>
        </section>
      </div>

      <FaceVerifyModal
        isOpen={role === "voter" && voterStep === "face"}
        party={null}
        onClose={() => setVoterStep("login")}
        onVerified={() => {
          setFaceVerified(true);
          setVoterStep("otp");
          setStatus("Face verified. Enter OTP to continue.");
        }}
      />
    </div>
  );
}
