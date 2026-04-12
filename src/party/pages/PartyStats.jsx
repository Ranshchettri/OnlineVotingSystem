import { useEffect, useState } from "react";
import api from "../../services/api";
import { getPartyLogoSrc, getPartyShortLabel } from "../../shared/utils/partyDisplay";
import "../styles/stats.css";

const TimelineIcon = ({ label }) => {
  if (label.includes("Start")) return <i className="ri-play-circle-line" />;
  if (label.includes("Progress")) return <i className="ri-time-line" />;
  if (label.includes("End")) return <i className="ri-flag-line" />;
  return <i className="ri-trophy-line" />;
};

export default function PartyStats() {
  const [activeElections, setActiveElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [current, setCurrent] = useState({
    electionName: "Current Election",
    electionSystem: "FPTP",
    totalSeats: 0,
    partyName: "",
    votes: 0,
    position: 0,
    share: 0,
    lead: 0,
    seats: 0,
    status: "PENDING",
    short: "PRT",
    logoSrc: "",
    color: "#dc2626",
  });
  const [rankings, setRankings] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [coalitionSuggestions, setCoalitionSuggestions] = useState([]);
  const [majorityInfo, setMajorityInfo] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, activeRes] = await Promise.all([
          api.get("/parties/profile/full").catch(() => ({ data: { data: {} } })),
          api.get("/elections/active").catch(() => ({ data: [] })),
        ]);

        const ownPartyProfile = profileRes.data?.data || {};
        const activeElectionList = Array.isArray(activeRes.data?.data)
          ? activeRes.data.data
          : Array.isArray(activeRes.data)
            ? activeRes.data
            : [];
        const sortedActive = [...activeElectionList].sort((a, b) => {
          const startA = new Date(a.startDate || 0).getTime();
          const startB = new Date(b.startDate || 0).getTime();
          return startA - startB;
        });

        setActiveElections(sortedActive);

        if (sortedActive.length === 0) {
          setCurrent((prev) => ({
            ...prev,
            electionName: "Current Election",
            electionSystem: "FPTP",
            partyName: ownPartyProfile.name || "Your Party",
            votes: 0,
            position: 0,
            share: 0,
            lead: 0,
            seats: 0,
            status: "PENDING",
            short: getPartyShortLabel(ownPartyProfile, "PRT"),
            logoSrc: getPartyLogoSrc(ownPartyProfile),
            color: ownPartyProfile.color || "#dc2626",
          }));
          setRankings([]);
          setCoalitionSuggestions([]);
          setMajorityInfo(null);
          setTimeline([]);
          setLastUpdated(new Date().toLocaleString());
          return;
        }

        const nextElectionId =
          selectedElectionId &&
          sortedActive.some(
            (election) =>
              String(election._id || election.id || "") === String(selectedElectionId),
          )
            ? selectedElectionId
            : String(sortedActive[0]._id || sortedActive[0].id || "");

        if (nextElectionId && nextElectionId !== selectedElectionId) {
          setSelectedElectionId(nextElectionId);
        }

        const selectedElection =
          sortedActive.find(
            (election) => String(election._id || election.id || "") === String(nextElectionId),
          ) || sortedActive[0];
        const electionId = String(selectedElection?._id || selectedElection?.id || "");

        const standingsRes = electionId
          ? await api.get(`/results/party/${electionId}`).catch(() => null)
          : null;
        const standingsData = standingsRes?.data?.data || {};
        const standingsRows = Array.isArray(standingsData.parties)
          ? standingsData.parties
          : [];

        const rankingData = standingsRows
          .map((item, index) => {
            const votes = Number(item.votes || 0);
            const shareValue = Number(item.percentage || 0);
            return {
              id: (item.id || item.partyId || "").toString(),
              rank: Number(item.rank || index + 1),
              name: item.name || "Party",
              short: getPartyShortLabel(item, "PRT"),
              logoSrc: getPartyLogoSrc({ logo: item.logo, symbol: item.logo }),
              votes,
              share: `${shareValue.toFixed(1)}%`,
              shareWidth: `${shareValue}%`,
              color: item.color || "#7c7cff",
              isOwn:
                String(item.id || item.partyId || "") ===
                  String(ownPartyProfile.id || ownPartyProfile._id || "") ||
                String(item.name || "").trim().toLowerCase() ===
                  String(ownPartyProfile.name || "").trim().toLowerCase(),
              highlight: false,
              seats: Number(item.seats || 0),
              percentage: shareValue,
            };
          })
          .sort((a, b) => a.rank - b.rank)
          .map((item) => ({ ...item, highlight: item.isOwn }));

        const ownParty =
          rankingData.find((item) => item.isOwn) ||
          rankingData.find(
            (item) =>
              String(item.name || "").trim().toLowerCase() ===
              String(ownPartyProfile.name || "").trim().toLowerCase(),
          ) || {
            id: ownPartyProfile.id || ownPartyProfile._id || "",
            name: ownPartyProfile.name || "Your Party",
            short: getPartyShortLabel(ownPartyProfile, "PRT"),
            logoSrc: getPartyLogoSrc(ownPartyProfile),
            color: ownPartyProfile.color || "#dc2626",
            rank: 0,
            votes: 0,
            seats: 0,
            percentage: 0,
          };
        const ownPosition = Number(ownParty.rank || 0);
        const ownVotes = Number(ownParty.votes || 0);
        const ownVoteShare = Number(ownParty.percentage || 0);
        const leadOverSecond =
          rankingData.length > 1 && ownPosition === 1
            ? Math.max(ownVotes - Number(rankingData[1]?.votes || 0), 0)
            : 0;

        setCurrent({
          electionName: selectedElection?.title || "Current Election",
          electionSystem: standingsData.electionSystem || selectedElection?.electionSystem || "FPTP",
          totalSeats: Number(standingsData.totalSeats || 0),
          partyName: ownParty?.name || "Your Party",
          votes: ownVotes,
          position: ownPosition,
          share: ownVoteShare,
          lead: leadOverSecond,
          seats: Number(ownParty?.seats || 0),
          status: selectedElection?.status || "PENDING",
          short: ownParty?.short || getPartyShortLabel(ownPartyProfile, "PRT"),
          logoSrc: ownParty?.logoSrc || getPartyLogoSrc(ownPartyProfile),
          color: ownParty?.color || "#dc2626",
        });
        setCoalitionSuggestions(
          Array.isArray(standingsData.coalitionSuggestions)
            ? standingsData.coalitionSuggestions
            : [],
        );
        setMajorityInfo(standingsData.majority || null);

        setRankings(rankingData);
        setLastUpdated(new Date().toLocaleString());

        setTimeline(
          [
            { label: "Voting Started", value: selectedElection?.startDate },
            { label: "In Progress", value: "Live" },
            { label: "Voting Ends", value: selectedElection?.endDate },
            {
              label: "Results Announcement",
              value:
                String(selectedElection?.status || "").toLowerCase() === "ended"
                  ? "Published"
                  : selectedElection?.endDate,
            },
          ].filter(Boolean),
        );
      } catch (err) {
        console.error("Failed to load party stats", err.message);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [selectedElectionId]);

  const isSeatBasedElection = ["PR", "HYBRID"].includes(
    String(current.electionSystem || "").toUpperCase(),
  );
  const normalizedStatus = String(current.status || "").toLowerCase();
  const totalVotesCast = rankings.reduce((sum, item) => sum + Number(item.votes || 0), 0);
  const leaderVotes = Number(rankings[0]?.votes || 0);
  const seatsMajorityMark = Math.floor(Number(current.totalSeats || 0) / 2) + 1;
  const majorityGap = isSeatBasedElection
    ? Math.max(seatsMajorityMark - Number(current.seats || 0), 0)
    : Math.max(
        Math.floor(totalVotesCast / 2) +
          1 -
          Number(current.votes || 0),
        0,
      );
  const comparisonItems =
    normalizedStatus === "upcoming"
      ? [
          { label: "Election status", value: "Upcoming" },
          { label: "Registered parties", value: rankings.length || 0 },
          { label: "Your party status", value: "Waiting for voting" },
          {
            label: isSeatBasedElection ? "Majority seats" : "Majority target",
            value: isSeatBasedElection ? seatsMajorityMark : "Will update live",
          },
        ]
      : normalizedStatus === "running" && totalVotesCast === 0
        ? [
            { label: "Election status", value: "Running" },
            { label: "Votes recorded", value: 0 },
            { label: "Competing parties", value: rankings.length || 0 },
            {
              label: isSeatBasedElection ? "Seats needed for majority" : "Votes needed for majority",
              value: majorityGap.toLocaleString(),
            },
          ]
        : [
            {
              label: current.position === 1 ? "Lead over 2nd place" : "Gap to leader",
              value:
                current.position === 1
                  ? `+${Number(current.lead || 0).toLocaleString()} votes`
                  : `${Math.max(leaderVotes - Number(current.votes || 0), 0).toLocaleString()} votes`,
            },
            { label: "Total votes cast", value: totalVotesCast.toLocaleString() },
            { label: "Competing parties", value: rankings.length },
            {
              label: isSeatBasedElection ? "Seats needed for majority" : "Votes needed for majority",
              value: majorityGap.toLocaleString(),
            },
          ];

  return (
    <div className="party-page party-page--stats">
      <div className="party-page-header">
        <div>
          <h1>Current Election Stats</h1>
          <p>Live performance overview for your party</p>
        </div>
        <span className="party-pill green">Live Data</span>
      </div>

      {activeElections.length > 1 ? (
        <div className="stats-election-switcher">
          {activeElections.map((election) => {
            const id = String(election._id || election.id || "");
            const active = id === String(selectedElectionId || "");
            return (
              <button
                key={id}
                type="button"
                className={`stats-election-chip ${active ? "active" : ""}`}
                onClick={() => setSelectedElectionId(id)}
              >
                <strong>{election.title || "Election"}</strong>
                <span>{String(election.electionSystem || "FPTP").toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="stats-hero">
        <div className="stats-hero-header">
          <span className="stats-live-dot" />
          <div>
            <span className="stats-hero-label">Your Party - Live Data</span>
            <div className="stats-hero-title">
              <div
                className="stats-hero-logo"
                style={current.logoSrc ? { background: "#fff" } : { background: current.color }}
              >
                {current.logoSrc ? (
                  <img src={current.logoSrc} alt={current.partyName} />
                ) : (
                  current.short
                )}
              </div>
              <div>
                <strong>{current.partyName}</strong>
                <span>{current.status}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="stats-hero-grid">
          <div>
            <span>Your Votes</span>
            <strong>{current.votes}</strong>
          </div>
          <div>
            <span>Current Position</span>
            <strong>{current.position || "-"}</strong>
          </div>
          <div>
            <span>Vote Share</span>
            <strong>{current.share}%</strong>
          </div>
          <div>
            <span>{isSeatBasedElection ? "Seats Won" : "Lead"}</span>
            <strong>{isSeatBasedElection ? current.seats : current.lead}</strong>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-section-head">
          <div>
            <h3>Live Vote Rankings</h3>
            <p>All parties performance (Read only)</p>
          </div>
          <span>{lastUpdated}</span>
        </div>
        <div className="stats-rank-list">
          {rankings.length === 0 ? (
            <div className="stats-empty">No live ranking data available yet.</div>
          ) : (
            rankings.map((item) => (
              <div
                key={`${item.rank}-${item.name}`}
                className={`stats-rank-item ${item.highlight ? "highlight" : ""}`}
              >
                <div className="stats-rank-left">
                  <div className={`stats-rank-number rank-${item.rank}`}>
                    {item.rank}
                  </div>
                  <div
                    className="stats-rank-logo"
                    style={item.logoSrc ? { background: "#fff" } : { background: item.color }}
                  >
                    {item.logoSrc ? (
                      <img src={item.logoSrc} alt={item.name} />
                    ) : (
                      item.short
                    )}
                  </div>
                  <div>
                    <div className="stats-rank-name">
                      {item.name}
                      {item.isOwn ? <span>Your Party</span> : item.rank === 1 ? <span>Leading</span> : null}
                    </div>
                    <div className="stats-rank-sub">Vote share</div>
                  </div>
                </div>
                <div className="stats-rank-right">
                  <strong>{item.votes}</strong>
                  <span>{item.share} share</span>
                </div>
                <div className="stats-rank-bar">
                  <span style={{ width: item.shareWidth, background: item.color }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <h3>Vote Comparison</h3>
          <div className="stats-compare">
            {comparisonItems.map((item, index) => (
              <div key={item.label} className={`stats-compare-item ${index === 0 ? "highlight" : ""}`}>
                <span className="stats-compare-label">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="stats-card">
          <h3>Election Timeline</h3>
          <div className="stats-timeline">
            {(timeline.length ? timeline : [{ label: "Timeline unavailable", value: "-" }]).map((item) => {
              const status = item.label.includes("Start")
                ? "start"
                : item.label.includes("Progress")
                  ? "progress"
                  : item.label.includes("End")
                    ? "end"
                    : "result";
              return (
                <div key={item.label} className="stats-timeline-item">
                  <span className={`stats-timeline-icon ${status}`}>
                    <TimelineIcon label={item.label} />
                  </span>
                  <span>{item.label}</span>
                  <strong>
                    {item.value && item.value !== "Live"
                      ? new Date(item.value).toLocaleString()
                      : item.value || "Live"}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isSeatBasedElection ? (
        <div className="stats-card">
          <h3>PR Majority & Coalition</h3>
          <div className="stats-compare">
            <div className="stats-compare-item highlight">
              <span className="stats-compare-label">Majority mark</span>
              <strong>
                {seatsMajorityMark} / {Number(current.totalSeats || 0)} seats
              </strong>
            </div>
            <div className="stats-compare-item">
              <span className="stats-compare-label">Majority status</span>
              <strong>{majorityInfo?.type || "Coalition Required"}</strong>
            </div>
            {coalitionSuggestions.slice(0, 3).map((item, index) => (
              <div key={`${item.partyNames?.join("-") || index}`} className="stats-compare-item">
                <span className="stats-compare-label">
                  {(item.partyNames || []).join(" + ") || "Coalition"}
                </span>
                <strong>{Number(item.totalSeats || 0)} seats</strong>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="stats-info">
        <div className="stats-info-head">
          <span>i</span>
          <div>
            <strong>Real-Time Data</strong>
            <p>
              Vote counts are updated live from backend database and admin-controlled metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
