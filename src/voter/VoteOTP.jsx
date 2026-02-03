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
    <div className="auth-card">
      <h2>OTP Verification</h2>

      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        maxLength={6}
        className="otp-input"
      />

      <button
        onClick={confirmVote}
        className="btn btn-primary"
        disabled={loading}
        style={{ marginTop: "1rem" }}
      >
        {loading ? "Submitting..." : "Submit Vote"}
      </button>
    </div>
  );
}
