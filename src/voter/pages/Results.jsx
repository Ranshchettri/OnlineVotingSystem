import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { formatDate, getTimeLeft, normalizeElectionStatus, pickCurrentElection } from "../utils/election";
import "../styles/results.css";

const mapParty = (party) => ({
  id: (party._id || party.id || "").toString(),
  electionId:
    party.electionId?._id?.toString?.() || party.electionId?.toString?.() || "",
  name: party.name || "Unnamed Party",
  short: party.shortName || party.symbol || party.name?.slice(0, 3) || "PRT",
  color: party.color || "#2563eb",
  logo: party.logo || party.symbol || "",
  votes: Number(party.totalVotes || party.currentVotes || 0),
});

const resolveElectionStandings = (election, partiesByElection, partyById, fallbackParties) => {
  const electionId = (election._id || election.id || "").toString();
  let standings = partiesByElection[electionId] || [];

  if (standings.length === 0 && Array.isArray(election.participatingParties)) {
    standings = election.participatingParties
      .map((entry) => {
        const partyId = entry.partyId?._id?.toString?.() || entry.partyId?.toString?.() || "";
        const ref = partyById[partyId] || {};
        return {
          id: partyId || ref.id || "",
          name: ref.name || "Party",
          short: ref.short || "PRT",
          color: ref.color || "#2563eb",
          logo: ref.logo || "",
          votes: Number(entry.votes || 0),
        };
      })
      .filter((party) => party.id || party.name);
  }

  if (standings.length === 0) {
    standings = [...fallbackParties].sort((a, b) => b.votes - a.votes).slice(0, 2);
  }

  const sorted = [...standings].sort((a, b) => b.votes - a.votes);
  const totalVotes =
    Number(election.totalVotes || 0) ||
    sorted.reduce((sum, party) => sum + Number(party.votes || 0), 0);
  const winner = sorted[0] || null;
  const runnerUp = sorted[1] || null;
  const winnerVotes = Number(winner?.votes || 0);
  const runnerUpVotes = Number(runnerUp?.votes || 0);
  const marginVotes = Math.max(0, winnerVotes - runnerUpVotes);
  const winnerShare = totalVotes > 0 ? `${((winnerVotes / totalVotes) * 100).toFixed(1)}%` : "0.0%";

  return {
    winner,
    runnerUp,
    totalVotes,
    winnerVotes,
    marginVotes,
    winnerShare,
  };
};

export default function Results() {
  const [elections, setElections] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [electionsRes, partiesRes] = await Promise.all([
          api.get("/elections"),
          api.get("/parties"),
        ]);

        const electionList = Array.isArray(electionsRes.data?.data)
          ? electionsRes.data.data
          : Array.isArray(electionsRes.data)
            ? electionsRes.data
            : [];
        const partyListRaw = Array.isArray(partiesRes.data?.data?.parties)
          ? partiesRes.data.data.parties
          : Array.isArray(partiesRes.data?.data)
            ? partiesRes.data.data
            : Array.isArray(partiesRes.data)
              ? partiesRes.data
              : [];

        setElections(electionList);
        setParties(partyListRaw.map(mapParty));
      } catch (error) {
        console.error("Failed to load results:", error?.response?.data || error.message);
        setElections([]);
        setParties([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const currentElection = useMemo(() => pickCurrentElection(elections), [elections]);

  const pastResults = useMemo(
    () =>
      elections
        .filter((election) => normalizeElectionStatus(election) === "ended")
        .sort((a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0)),
    [elections],
  );

  const partiesByElection = useMemo(
    () =>
      parties.reduce((acc, party) => {
        const electionId =
          party.electionId?._id?.toString?.() || party.electionId?.toString?.() || "unassigned";
        if (!acc[electionId]) acc[electionId] = [];
        acc[electionId].push(party);
        return acc;
      }, {}),
    [parties],
  );

  const partyById = useMemo(
    () =>
      parties.reduce((acc, party) => {
        acc[party.id] = party;
        return acc;
      }, {}),
    [parties],
  );

  return (
    <div>
      <div className="results-header">
        <h1>Election Results</h1>
        <p>Current and historical election outcomes</p>
      </div>

      <div className="results-current">
        <div>
          <h2>{currentElection?.title || "No election running right now"}</h2>
          <div className="results-current-status">
            <span />
            <p>
              {currentElection && normalizeElectionStatus(currentElection) === "running"
                ? "Election in Progress"
                : "Live updates resume once next election starts"}
            </p>
          </div>
        </div>

        <div className="results-current-right">
          <div className="results-current-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 16v-5" />
              <path d="M12 16V9" />
              <path d="M16 16v-8" />
            </svg>
          </div>
          <p>
            {currentElection && normalizeElectionStatus(currentElection) === "running"
              ? `Ends in ${getTimeLeft(currentElection.endDate)}`
              : "Results Pending"}
          </p>
        </div>
      </div>

      <div className="results-section">
        <h3>Past Election Results</h3>
        <p>Historical winners from completed elections.</p>

        {loading ? <p style={{ marginTop: 16 }}>Loading results...</p> : null}
        {!loading && pastResults.length === 0 ? (
          <p style={{ marginTop: 16 }}>No completed elections available yet.</p>
        ) : null}

        {pastResults.map((election) => {
          const {
            winner,
            runnerUp,
            totalVotes,
            winnerVotes,
            marginVotes,
            winnerShare,
          } = resolveElectionStandings(election, partiesByElection, partyById, parties);

          return (
            <div key={election._id || election.id} className="result-card">
              <div className="result-card-header">
                <div>
                  <h4>{election.title || "Election"}</h4>
                  <span>Year: {new Date(election.endDate || election.createdAt || Date.now()).getFullYear()}</span>
                </div>
                <div className="result-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Winner
                </div>
              </div>

              <div className="result-body">
                <div className="result-winner">
                  <div className="result-logo" style={{ background: winner?.color || "#2563eb" }}>
                    {winner?.logo ? (
                      <img src={winner.logo} alt={winner.name} className="result-logo-img" />
                    ) : (
                      <span>{winner?.short || "N/A"}</span>
                    )}
                  </div>

                  <div className="result-info">
                    <h5>{winner?.name || "Winner unavailable"}</h5>
                    <p>{runnerUp ? `Runner-up: ${runnerUp.name}` : "Runner-up data unavailable"}</p>
                  </div>
                </div>

                <div className="result-stats">
                  <div>
                    <span>Total Votes</span>
                    <strong>{winnerVotes.toLocaleString()}</strong>
                  </div>

                  <div className="result-divider" />

                  <div>
                    <span>Vote Share</span>
                    <strong>{winnerShare}</strong>
                    <small>Total Votes: {Number(totalVotes || 0).toLocaleString()}</small>
                  </div>
                </div>

                <div className="result-margin">
                  <span>Victory Margin</span>
                  <strong>{marginVotes.toLocaleString()} votes</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
