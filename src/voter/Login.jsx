import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const demoVoter = {
  email: "demo.voter@evote.gov.np",
  voterId: "NP2025-001",
  faceApproved: true,
};

export default function Login() {
  const [step, setStep] = useState("credentials");
  const [form, setForm] = useState({
    identifier: "",
    voterId: "",
  });
  const [info, setInfo] = useState(
    "Only face-approved voters can complete 2FA. Real email verification will be wired soon.",
  );
  const [error, setError] = useState("");
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [matchStatus, setMatchStatus] = useState("idle");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const nav = useNavigate();

  const startCamera = async () => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera not supported on this device.");
        return;
      }
      const media = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (err) {
      setCameraError(
        err.message || "Camera unavailable. Please allow camera access.",
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (step === "face") {
      startCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const goToFaceStep = () => {
    if (!form.identifier.trim() || !form.voterId.trim()) {
      setError("Email/phone and Voter ID are required.");
      return;
    }
    setError("");
    const isDemo =
      form.identifier.toLowerCase() === demoVoter.email &&
      form.voterId.trim().toUpperCase() === demoVoter.voterId;

    if (isDemo) {
      setInfo(
        "Demo account detected. Face approval is the only active 2FA right now.",
      );
    } else {
      setInfo(
        "Face check is live. Email OTP for real voters will be connected later.",
      );
    }
    setStep("face");
  };

  const captureAndVerify = async () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video.videoWidth) {
      setCameraError("Camera feed not ready. Please retry.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedPhoto(dataUrl);
    setVerifying(true);
    setMatchStatus("checking");

    // Simulate server-side face verification (demo-only).
    setTimeout(() => {
      setVerifying(false);
      setMatchStatus("approved");
      stopCamera();
      setInfo(
        "Face matched and approved (demo). Backend matcher will replace this step.",
      );
    }, 1200);
  };

  const completeLogin = () => {
    localStorage.setItem(
      "voter-demo",
      JSON.stringify({
        email: form.identifier,
        voterId: form.voterId,
        faceVerified: matchStatus === "approved",
      }),
    );
    nav("/voter/dashboard");
  };

  const resetFlow = () => {
    stopCamera();
    setCapturedPhoto("");
    setMatchStatus("idle");
    setVerifying(false);
    setStep("credentials");
  };

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <section className="auth-hero">
          <div className="auth-badge">
            <i className="ri-checkbox-circle-line" aria-hidden="true" />
            Face-first 2FA
          </div>
          <h1>Nepal Online Voting — Voter Access</h1>
          <p>
            Secure sign-in with face approval. Email OTP will be re-enabled once
            live mail delivery is connected.
          </p>
          <div className="mini-card" style={{ color: "#0f172a" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <i className="ri-information-line" aria-hidden="true" />
              <span>Demo login for review</span>
            </div>
            <ul style={{ margin: "10px 0 0 18px", color: "#0f172a" }}>
              <li>Email: {demoVoter.email}</li>
              <li>Voter ID: {demoVoter.voterId}</li>
              <li>2FA: Face approval only (camera required)</li>
            </ul>
          </div>
        </section>

        <div className="auth-card">
          <header>
            <div className="stepper">
              <span className={`step-pill ${step === "credentials" ? "active" : ""}`}>
                1
              </span>
              <div className="step-divider" />
              <span className={`step-pill ${step === "face" ? "active" : ""}`}>
                2
              </span>
            </div>
            <span className="state-chip info">
              <i className="ri-shield-keyhole-line" aria-hidden="true" />
              2FA: Face only
            </span>
          </header>

          <p className="auth-subtitle">{info}</p>
          {error && (
            <div className="alert-soft">
              <i className="ri-error-warning-line" aria-hidden="true" />
              {error}
            </div>
          )}
          {cameraError && step === "face" && (
            <div className="alert-soft">
              <i className="ri-camera-off-line" aria-hidden="true" />
              {cameraError}
            </div>
          )}

          {step === "credentials" && (
            <div className="form-stack">
              <div>
                <div className="input-label">Email or Phone</div>
                <input
                  className="input-field"
                  type="text"
                  placeholder="demo.voter@evote.gov.np"
                  value={form.identifier}
                  onChange={(e) =>
                    setForm({ ...form, identifier: e.target.value })
                  }
                />
                <p className="input-hint">
                  Use the demo email above for now. Real email check will unlock
                  later.
                </p>
              </div>

              <div>
                <div className="input-label">Voter ID</div>
                <input
                  className="input-field"
                  type="text"
                  placeholder="NP2025-001"
                  value={form.voterId}
                  onChange={(e) => setForm({ ...form, voterId: e.target.value })}
                />
                <p className="input-hint">Must match a face-approved voter ID.</p>
              </div>

              <div className="auth-actions">
                <button className="btn-primary" onClick={goToFaceStep}>
                  Continue to Face Check
                  <i className="ri-arrow-right-line" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {step === "face" && (
            <div className="form-stack">
              <div className="face-box">
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured face" />
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted />
                )}
                <div className="face-overlay" />
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />

              <div className="auth-actions" style={{ flexWrap: "wrap" }}>
                <button
                  className="btn-primary"
                  onClick={captureAndVerify}
                  disabled={verifying}
                >
                  <i className="ri-camera-line" aria-hidden="true" />
                  {verifying ? "Checking..." : "Capture & Verify"}
                </button>
                <button className="btn-ghost" onClick={resetFlow}>
                  <i className="ri-arrow-left-line" aria-hidden="true" />
                  Edit details
                </button>
              </div>

              {matchStatus === "approved" && (
                <div className="state-chip success">
                  <i className="ri-checkbox-circle-line" aria-hidden="true" />
                  Face approved — proceed to dashboard
                </div>
              )}
              {matchStatus === "checking" && (
                <div className="state-chip info">
                  <i className="ri-loader-4-line ri-spin" aria-hidden="true" />
                  Matching face...
                </div>
              )}

              <button
                className="btn-secondary"
                onClick={completeLogin}
                disabled={matchStatus !== "approved"}
              >
                Finish Login
                <i className="ri-shield-check-line" aria-hidden="true" />
              </button>

              <div className="mini-card">
                <strong>Why only face 2FA?</strong>
                <p style={{ marginTop: 6, color: "#334155" }}>
                  Mail delivery is disabled in this preview build. Once SMTP is
                  wired, we will pair face approval with OTP for production.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
