import { useEffect, useRef, useState } from "react";
import { getPartyLogoSrc } from "../../shared/utils/partyDisplay";

/**
 * Face verification modal used before OTP submission while voting.
 * Camera access is demo-only; match is simulated for UI review.
 */
export default function FaceVerifyModal({
  isOpen,
  party,
  onClose,
  onVerified,
}) {
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null); // success | failed | null
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    if (!isOpen) return;
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
        err?.message || "Camera unavailable. Please allow camera access.",
      );
    }
  };

  useEffect(() => {
    startCamera();
    const currentVideo = videoRef.current;
    return () => {
      const currentStream = currentVideo?.srcObject;
      if (currentStream?.getTracks) {
        currentStream.getTracks().forEach((t) => t.stop());
      } else if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      setStream(null);
      setCaptured("");
      setResult(null);
      setIsChecking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const captureAndVerify = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (!videoRef.current.videoWidth) {
      setCameraError("Camera feed not ready. Please retry.");
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCaptured(dataUrl);
    setIsChecking(true);
    setResult(null);

    // Demo matching: approve after short delay
    setTimeout(() => {
      setIsChecking(false);
      setResult("success");
      onVerified?.();
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
    }, 1200);
  };

  const retake = () => {
    setCaptured("");
    setResult(null);
    setIsChecking(false);
    if (!stream) {
      startCamera();
    }
  };

  if (!isOpen) return null;

  const partyName = party?.name || "Party";
  const partyLeader = party?.leader;
  const partyLogo = getPartyLogoSrc(party);

  return (
    <div className="otp-backdrop">
      <div className="face-modal" role="dialog" aria-modal="true">
        <header className="face-hero">
          <div className="face-hero-party">
            <div className="face-party-logo">
              {partyLogo ? (
                <img src={partyLogo} alt={partyName} />
              ) : (
                (party?.short || partyName[0] || "V").slice(0, 2)
              )}
            </div>
            <div>
              <p className="face-hero-label">Voter verification </p>
              <h4>{partyName}</h4>
              <span>{partyLeader ? `Leader: ${partyLeader}` : " Verify your identity to login"}</span>Voter
            </div>
          </div>
          <button className="face-close" type="button" onClick={onClose} aria-label="Close face verification">
            <i className="ri-close-line" aria-hidden="true" />
          </button>
        </header>

        <div className="face-body">
          <div className="face-step-icon">
            <i className="ri-checkbox-circle-line" aria-hidden="true" />
          </div>
          <h3 className="face-title">Face Verification</h3>
          <p className="face-subtitle">Position your face within the circle and capture</p>

          <div className="face-camera">
            {captured ? (
              <img src={captured} alt="Captured face" />
            ) : (
              <video ref={videoRef} autoPlay playsInline muted />
            )}
            <div className="face-overlay" />
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {cameraError ? (
            <div className="alert-soft">
              <i className="ri-camera-off-line" aria-hidden="true" />
              {cameraError}
            </div>
          ) : (
            <div className="face-hint">
              <i className="ri-information-line" aria-hidden="true" />
              Keep your face centered. This is the voter approval step before OTP verification.
            </div>
          )}

          <button
            type="button"
            className="face-capture-btn"
            onClick={captureAndVerify}
            disabled={isChecking}
          >
            <i className="ri-camera-line" aria-hidden="true" />
            {isChecking ? "Verifying..." : captured ? "Re-verify" : "Capture Photo"}
          </button>
          <button type="button" className="btn-ghost face-retake" onClick={retake}>
            <i className="ri-refresh-line" aria-hidden="true" />
            Retake
          </button>

          {isChecking && (
            <div className="state-chip info">
              <i className="ri-loader-4-line ri-spin" aria-hidden="true" />
              Matching face...
            </div>
          )}
          {result === "success" && (
            <div className="state-chip success">
              <i className="ri-checkbox-circle-line" aria-hidden="true" />
              Face verified. Continue to OTP.
            </div>
          )}
          {result === "failed" && (
            <div className="state-chip warn">
              <i className="ri-close-circle-line" aria-hidden="true" />
              Face did not match. Please retry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
