import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import VoteBanner from "../components/VoteBanner";
import PartyCard from "../components/PartyCard";
import EmailBanner from "../components/EmailBanner";
import WarningNotice from "../components/WarningNotice";
import OtpModal from "../components/OtpModal";
import VoteConfirmModal from "../components/VoteConfirmModal";
import FaceVerifyModal from "../components/FaceVerifyModal";
import api from "../../services/api";
import { confirmVote } from "../services/voteApi";
import { getStoredVoter } from "../utils/user";
import "../styles/overview.css";

export default function Overview() {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedPartyId, setVotedPartyId] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showEmailBanner, setShowEmailBanner] = useState(false);
  const [voteStep, setVoteStep] = useState(null);
  const [faceVerified, setFaceVerified] = useState(false);
  const [parties, setParties] = useState([]);
  const [electionOverview, setElectionOverview] = useState({
    title: "Election Overview",
    subtitle: "Live election data",
    electionName: "",
    activeLabel: "",
    activeEnds: "",
    statusTitle: "Election Status",
    statusText: "",
    statusEnds: "",
  });
  const [stats, setStats] = useState([
    { key: "votes", label: "Total Votes Cast", value: "–", tone: "green" },
    { key: "leading", label: "Currently Leading", value: "–", size: "sm", tone: "yellow" },
    { key: "parties", label: "Active Parties", value: "–", tone: "orange" },
    { key: "status", label: "Your Status", value: "Not Voted", size: "sm", tone: "red" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLive = async () => {
      try {
        setLoading(true);
        const [partiesRes, electionsRes] = await Promise.all([
          api.get("/parties"),
          api.get("/elections"),
        ]);
        const liveParties = partiesRes.data?.data || partiesRes.data || [];
        setParties(liveParties);

        const active = (electionsRes.data?.data || electionsRes.data || []).find(
          (e) => (e.status || "").toLowerCase() === "running",
        );
        if (active) {
          setElectionOverview({
            title: active.title || "Election Overview",
            subtitle: active.type || "",
            electionName: active.title,
            activeLabel: `Status: ${active.status}`,
            activeEnds: active.endDate ? `Ends: ${new Date(active.endDate).toLocaleString()}` : "",
            statusTitle: "Election Status",
            statusText: active.status || "",
            statusEnds: active.endDate ? `Ends: ${new Date(active.endDate).toLocaleString()}` : "",
          });
          setStats((prev) => [
            {
              key: "votes",
              label: "Total Votes Cast",
              value: active.totalVotes?.toLocaleString?.() || active.totalVotes || "–",
              tone: "green",
            },
            {
              key: "leading",
              label: "Currently Leading",
              value: liveParties[0]?.name || "–",
              size: "sm",
              tone: "yellow",
            },
            {
              key: "parties",
              label: "Active Parties",
              value: liveParties.length ? String(liveParties.length) : "–",
              tone: "orange",
            },
            {
              key: "status",
              label: "Your Status",
              value: hasVoted ? "Voted ✓" : "Not Voted",
              size: "sm",
              tone: hasVoted ? "green" : "red",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load live data; keeping placeholders", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadLive();
  }, [hasVoted]);

  useEffect(() => {
    if (!showEmailBanner) return undefined;
    const timer = setTimeout(() => setShowEmailBanner(false), 5000);
    return () => clearTimeout(timer);
  }, [showEmailBanner]);

  const statsWithStatus = useMemo(
    () =>
      stats.map((stat) =>
        stat.key === "status"
          ? { ...stat, value: hasVoted ? "Voted ✓" : "Not Voted" }
          : stat,
      ),
    [hasVoted],
  );

  const handleVote = (party) => {
    setSelectedParty(party);
    setOtp("");
    setOtpError("");
    setFaceVerified(false);
    setVoteStep("confirm");
  };

  const handleConfirmVote = () => {
    if (!selectedParty) return;
    if (!faceVerified) {
      setOtpError("Complete face verification before entering OTP.");
      setVoteStep("face");
      return;
    }
    submitFinalVote();
  };

  const submitFinalVote = async () => {
    try {
      if (!selectedParty) return;
      await confirmVote({
        partyId: selectedParty._id || selectedParty.id,
        otp,
      });
      setHasVoted(true);
      setVotedPartyId(selectedParty._id || selectedParty.id);
      setSelectedParty(null);
      setShowEmailBanner(true);
      setVoteStep(null);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Vote confirmation failed");
    }
  };

  return (
    <div>
      <div className="overview-header">
        <div>
          <h1 className="overview-title">{electionOverview.title}</h1>
          <p className="overview-subtitle">{electionOverview.subtitle}</p>
        </div>
        <div className="overview-status">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          <div>
            {electionOverview.activeLabel}
            <small>{electionOverview.activeEnds}</small>
          </div>
        </div>
      </div>

      <EmailBanner
        visible={showEmailBanner}
        partyName={
          parties.find((party) => party.id === votedPartyId)?.name || ""
        }
      />

      <div className="overview-stats">
        {statsWithStatus.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            size={stat.size}
            tone={stat.tone}
          />
        ))}
      </div>

      <VoteBanner hasVoted={hasVoted} />

      <div className="overview-section">
        <h3>Active Political Parties</h3>
        <span>Sorted by development score</span>
      </div>

      <div className="overview-party-list">
        {parties.map((party) => (
          <PartyCard
            key={party.name}
            party={party}
            hasVoted={hasVoted}
            isVotedParty={party.id === votedPartyId}
            onVote={handleVote}
          />
        ))}
      </div>

      <WarningNotice />

      <VoteConfirmModal
        isOpen={voteStep === "confirm"}
        party={selectedParty}
        electionName={electionOverview.electionName || electionOverview.title}
        voterId={getStoredVoter()?.voterId}
        onCancel={() => {
          setSelectedParty(null);
          setVoteStep(null);
        }}
        onProceed={() => setVoteStep("face")}
      />

      <FaceVerifyModal
        isOpen={voteStep === "face"}
        party={selectedParty}
        onClose={() => {
          setVoteStep("confirm");
          setFaceVerified(false);
        }}
        onVerified={() => {
          setFaceVerified(true);
          setVoteStep("otp");
          setOtpError("");
        }}
      />

      <OtpModal
        isOpen={voteStep === "otp"}
        partyName={selectedParty?.name}
        otpValue={otp}
        onChange={setOtp}
        error={otpError}
        faceVerified={faceVerified}
        onClose={() => {
          setSelectedParty(null);
          setOtpError("");
          setFaceVerified(false);
          setVoteStep(null);
        }}
        onConfirm={handleConfirmVote}
      />
    </div>
  );
}
