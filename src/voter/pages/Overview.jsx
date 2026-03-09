import { useCallback, useEffect, useMemo, useState } from "react";
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
import { getPartyLogoSrc, getPartyShortLabel } from "../../shared/utils/partyDisplay";
import {
  formatDateTime,
  getTimeLeft,
  getTimeUntil,
  normalizeElectionStatus,
  pickCurrentElection,
} from "../utils/election";
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
  const [currentElection, setCurrentElection] = useState(null);
  const [roleCanVote, setRoleCanVote] = useState(true);
  const [electionOverview, setElectionOverview] = useState({
    title: "Election Overview",
    subtitle: "Loading live election data",
    electionName: "",
    activeLabel: "",
    activeEnds: "",
  });
  const [stats, setStats] = useState([
    { key: "votes", label: "Total Votes Cast", value: "N/A", tone: "green" },
    {
      key: "leading",
      label: "Currently Leading",
      value: "N/A",
      size: "sm",
      tone: "yellow",
    },
    { key: "parties", label: "Active Parties", value: "N/A", tone: "orange" },
    {
      key: "status",
      label: "Your Status",
      value: "Not Voted",
      size: "sm",
      tone: "red",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const loadLive = useCallback(async () => {
    try {
      setLoading(true);
      const [partiesRes, electionsRes, activeElectionsRes, votesRes, meRes] = await Promise.all([
        api.get("/parties"),
        api.get("/elections"),
        api.get("/elections/active").catch(() => ({ data: [] })),
        api.get("/votes/me").catch(() => ({ data: { data: [] } })),
        api.get("/auth/me").catch(() => ({ data: { data: null } })),
      ]);

      const role = String(meRes.data?.data?.role || "voter").toLowerCase();
      setRoleCanVote(role === "voter");

      const electionList = Array.isArray(electionsRes.data?.data)
        ? electionsRes.data.data
        : Array.isArray(electionsRes.data)
          ? electionsRes.data
          : [];

      const activeElectionList = Array.isArray(activeElectionsRes.data?.data)
        ? activeElectionsRes.data.data
        : Array.isArray(activeElectionsRes.data)
          ? activeElectionsRes.data
          : [];

      const selectedElection = activeElectionList[0] || pickCurrentElection(electionList);
      const selectedElectionId =
        selectedElection?._id?.toString?.() || selectedElection?.id?.toString?.();
      const selectedStatus = normalizeElectionStatus(selectedElection);
      const statusLabel = selectedStatus.toUpperCase();

      const standingsRes = selectedElectionId
        ? await api.get(`/results/party/${selectedElectionId}`).catch(() => null)
        : null;
      const standingsData = standingsRes?.data?.data || {};
      const standingsRows = Array.isArray(standingsData.parties)
        ? standingsData.parties
        : [];
      const standingsMap = new Map(
        standingsRows.map((row) => [
          (row.id || row.partyId || "").toString(),
          {
            votes: Number(row.votes || 0),
            percentage: Number(row.percentage || 0),
            name: row.name || "Party",
            logo: row.logo || "",
            color: row.color || "#2563eb",
          },
        ]),
      );
      const standingsTotalVotes = Number(standingsData.totalVotes || 0);

      const partyListRaw = Array.isArray(partiesRes.data?.data?.parties)
        ? partiesRes.data.data.parties
        : Array.isArray(partiesRes.data?.data)
          ? partiesRes.data.data
          : Array.isArray(partiesRes.data)
            ? partiesRes.data
            : [];

      const filteredByElection = partyListRaw.filter((party) => {
        const partyElectionId =
          party.electionId?._id?.toString?.() ||
          party.electionId?.toString?.() ||
          null;
        if (!selectedElectionId) return true;
        return !partyElectionId || partyElectionId === selectedElectionId;
      });

      const partySource = filteredByElection.length > 0 ? filteredByElection : partyListRaw;

      const partyList = partySource
        .filter((party) => {
          const normalized = String(party.status || "").toUpperCase();
          if (["REJECTED", "BLOCKED", "PENDING"].includes(normalized)) return false;
          if (party.isActive === false) return false;
          return true;
        })
        .map((party) => ({
          id: (party._id || party.id || "").toString(),
          name: party.name || "Unnamed Party",
          leader: party.leader || "N/A",
          votes: Number(
            standingsMap.get((party._id || party.id || "").toString())?.votes || 0,
          ),
          score: Number(party.development || party.goodWork || 0),
          short: getPartyShortLabel(party, "PRT"),
          shortName: party.shortName || "",
          symbol: party.symbol || "",
          logo: getPartyLogoSrc(party),
          color: party.color || "#2563eb",
        }));

      standingsRows.forEach((row) => {
        const id = (row.id || row.partyId || "").toString();
        if (!id || partyList.some((party) => party.id === id)) return;
        partyList.push({
          id,
          name: row.name || "Unnamed Party",
          leader: "N/A",
          votes: Number(row.votes || 0),
          score: 0,
          short: getPartyShortLabel(row, "PRT"),
          shortName: row.shortName || "",
          symbol: row.symbol || "",
          logo: getPartyLogoSrc(row),
          color: row.color || "#2563eb",
        });
      });

      const partyListWithRank = partyList
        .sort((a, b) => (b.votes === a.votes ? b.score - a.score : b.votes - a.votes))
        .map((party, index) => ({ ...party, rank: index + 1 }));

      const electionVotes = standingsTotalVotes || Number(selectedElection?.totalVotes || 0);
      const partiesWithShare = partyListWithRank.map((party) => {
        const standingsRow = standingsMap.get(party.id);
        if (standingsRow) {
          return {
            ...party,
            share: `${Number(standingsRow.percentage || 0).toFixed(1)}%`,
          };
        }
        const share =
          electionVotes > 0
            ? `${((party.votes / electionVotes) * 100).toFixed(1)}%`
            : "0.0%";
        return { ...party, share };
      });
      setParties(partiesWithShare);
      setCurrentElection(selectedElection || null);

      const voteList = Array.isArray(votesRes.data?.data)
        ? votesRes.data.data
        : Array.isArray(votesRes.data)
          ? votesRes.data
          : [];
      const relevantVote = selectedElectionId
        ? voteList.find(
            (vote) =>
              vote.electionId?.toString?.() === selectedElectionId ||
              vote.electionId === selectedElectionId,
          )
        : voteList[0];

      const voted = Boolean(relevantVote);
      const votedParty =
        relevantVote?.partyId?.toString?.() || relevantVote?.partyId || null;
      setHasVoted(voted);
      setVotedPartyId(votedParty);

      const activeEndsText = (() => {
        if (!selectedElection) return "";
        if (selectedStatus === "running") return `Ends in ${getTimeLeft(selectedElection.endDate)}`;
        if (selectedStatus === "upcoming") return getTimeUntil(selectedElection.startDate);
        return selectedElection.endDate
          ? `Ended on ${formatDateTime(selectedElection.endDate)}`
          : "Ended";
      })();

      setElectionOverview({
        title: selectedElection?.title || "Election Overview",
        subtitle: selectedElection
          ? `${selectedElection.type || "Election"} election`
          : "No active election available",
        electionName: selectedElection?.title || "",
        activeLabel: selectedElection ? `Status: ${statusLabel}` : "Status: N/A",
        activeEnds: activeEndsText,
      });

      setStats([
        {
          key: "votes",
          label: "Total Votes Cast",
          value: Number.isFinite(electionVotes) ? Number(electionVotes).toLocaleString() : "0",
          tone: "green",
        },
        {
          key: "leading",
          label: "Currently Leading",
          value: partiesWithShare[0]?.name || "N/A",
          size: "sm",
          tone: "yellow",
        },
        {
          key: "parties",
          label: "Active Parties",
          value: String(partiesWithShare.length),
          tone: "orange",
        },
        {
          key: "status",
          label: "Your Status",
          value: voted ? "Voted" : "Not Voted",
          size: "sm",
          tone: voted ? "green" : "red",
        },
      ]);
    } catch (err) {
      console.error("Failed to load voter overview:", err?.response?.data || err.message);
      setParties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLive();
  }, [loadLive]);

  useEffect(() => {
    if (!showEmailBanner) return undefined;
    const timer = setTimeout(() => setShowEmailBanner(false), 5000);
    return () => clearTimeout(timer);
  }, [showEmailBanner]);

  const statsWithStatus = useMemo(
    () =>
      stats.map((stat) =>
        stat.key === "status"
          ? { ...stat, value: hasVoted ? "Voted" : "Not Voted" }
          : stat,
      ),
    [hasVoted, stats],
  );

  const handleVote = (party) => {
    if (!roleCanVote) {
      setOtpError("Please login with a voter account to cast a vote.");
      return;
    }
    const status = normalizeElectionStatus(currentElection);
    if (!currentElection || status !== "running") {
      setOtpError("Voting is not open right now.");
      return;
    }

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
    const cleanedOtp = String(otp || "").trim();
    if (!/^\d{6}$/.test(cleanedOtp)) {
      setOtpError("Enter a valid 6-digit OTP.");
      return;
    }
    if (cleanedOtp !== "123456") {
      setOtpError("Invalid OTP. Use 123456 for demo.");
      return;
    }
    submitFinalVote();
  };

  const submitFinalVote = async () => {
    try {
      const electionId = currentElection?._id || currentElection?.id;
      if (!selectedParty || !electionId) return;

      await confirmVote({
        electionId,
        partyId: selectedParty._id || selectedParty.id,
      });

      setHasVoted(true);
      setVotedPartyId(selectedParty._id || selectedParty.id);
      setSelectedParty(null);
      setShowEmailBanner(true);
      setVoteStep(null);
      await loadLive();
    } catch (err) {
      setOtpError(err.response?.data?.message || "Vote confirmation failed");
    }
  };

  const derivedStatus = normalizeElectionStatus(currentElection);
  const isVotingOpen =
    roleCanVote &&
    Boolean(currentElection) &&
    (derivedStatus === "running" ||
      (String(currentElection?.status || "").toLowerCase() === "running" &&
        currentElection?.allowVoting !== false &&
        !currentElection?.isEnded));
  const currentStatus = normalizeElectionStatus(currentElection);
  const showPersistentVoteSuccess = hasVoted && currentStatus === "running";
  const votedPartyName =
    parties.find((party) => party.id?.toString?.() === votedPartyId?.toString?.())?.name ||
    "selected party";

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
          parties.find(
            (party) => party.id?.toString?.() === votedPartyId?.toString?.(),
          )?.name || ""
        }
      />

      {showPersistentVoteSuccess ? (
        <div className="email-banner" style={{ marginTop: 10 }}>
          <div className="email-banner-icon">
            <i className="ri-checkbox-circle-line" aria-hidden="true" />
          </div>
          <div>
            <h4>Vote Successfully Submitted!</h4>
            <p>You voted for {votedPartyName}. Your vote has been recorded successfully.</p>
          </div>
        </div>
      ) : null}

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

      <VoteBanner hasVoted={hasVoted} isVotingOpen={isVotingOpen} />

      <div className="overview-section">
        <h3>Active Political Parties</h3>
        <span>Sorted by development score</span>
      </div>

      <div className="overview-party-list">
        {parties.map((party) => (
          <PartyCard
            key={party.id}
            party={party}
            hasVoted={hasVoted}
            isVotedParty={party.id?.toString?.() === votedPartyId?.toString?.()}
            disableVoting={!isVotingOpen}
            onVote={handleVote}
          />
        ))}
      </div>

      {loading ? <p style={{ marginTop: 12 }}>Refreshing live data...</p> : null}

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
        mode="vote"
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
        onChange={(value) => {
          setOtp(value);
          if (otpError) setOtpError("");
        }}
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
