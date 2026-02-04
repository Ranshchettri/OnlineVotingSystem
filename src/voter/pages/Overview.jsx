import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import VoteBanner from "../components/VoteBanner";
import PartyCard from "../components/PartyCard";
import EmailBanner from "../components/EmailBanner";
import WarningNotice from "../components/WarningNotice";
import OtpModal from "../components/OtpModal";
import VoteConfirmModal from "../components/VoteConfirmModal";
import { electionOverview, stats, parties } from "../data/fakeVoterData";
import "../styles/overview.css";

export default function Overview() {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedPartyId, setVotedPartyId] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showEmailBanner, setShowEmailBanner] = useState(false);
  const [voteStep, setVoteStep] = useState(null);

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
    setVoteStep("confirm");
  };

  const handleConfirmVote = () => {
    if (!selectedParty) return;
    if (otp !== "12345") {
      setOtpError("Invalid OTP. Try 12345.");
      return;
    }
    setHasVoted(true);
    setVotedPartyId(selectedParty.id);
    setSelectedParty(null);
    setShowEmailBanner(true);
    setVoteStep(null);
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
        onCancel={() => {
          setSelectedParty(null);
          setVoteStep(null);
        }}
        onProceed={() => setVoteStep("otp")}
      />

      <OtpModal
        isOpen={voteStep === "otp"}
        partyName={selectedParty?.name}
        otpValue={otp}
        onChange={setOtp}
        error={otpError}
        onClose={() => {
          setSelectedParty(null);
          setOtpError("");
          setVoteStep(null);
        }}
        onConfirm={handleConfirmVote}
      />
    </div>
  );
}
