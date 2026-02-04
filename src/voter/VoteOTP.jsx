import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function VoteOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const confirmVote = async () => {
    const partyId = localStorage.getItem("voteParty");
    if (!partyId) return alert("No party selected");
    if (!otp || otp.length !== 6) return alert("Enter 6-digit OTP");

    try {
      setLoading(true);
      await axios.post("/voter/confirm-vote", {
        partyId,
        otp,
      });
      localStorage.removeItem("voteParty");
      alert("Vote submitted successfully");
      nav("/voter/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Vote confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Verify Your Vote</h1>

      <div
        style={{
          maxWidth: "500px",
          margin: "2rem auto",
          padding: "2rem",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <p style={{ color: "#666", textAlign: "center", marginBottom: "2rem" }}>
          We sent a 6-digit OTP code to your registered email address. Enter the
          code below to confirm your vote.
        </p>

        <div style={{ marginBottom: "2rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.8rem",
              fontWeight: "600",
              color: "#333",
            }}
          >
            Enter OTP Code
          </label>
          <input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength={6}
            style={{
              width: "100%",
              padding: "1rem",
              fontSize: "2rem",
              textAlign: "center",
              letterSpacing: "0.5rem",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          />
          <p
            style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#999" }}
          >
            {otp.length}/6
          </p>
        </div>

        <button
          onClick={confirmVote}
          disabled={!otp || otp.length !== 6 || loading}
          style={{
            width: "100%",
            padding: "1rem",
            backgroundColor: otp.length === 6 && !loading ? "#22b14c" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: otp.length === 6 && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Verifying..." : "Confirm Vote"}
        </button>

        <button
          onClick={() => nav("/voter/vote")}
          style={{
            width: "100%",
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "white",
            color: "#22b14c",
            border: "2px solid #22b14c",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Back to Vote Selection
        </button>
      </div>

      <p style={{ textAlign: "center", color: "#999", fontSize: "0.9rem" }}>
        Didn't receive the code? Check your spam folder or contact support.
      </p>
    </div>
  );
}
