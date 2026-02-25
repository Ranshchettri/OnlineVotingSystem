import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { formatDate, formatDateTime, normalizeElectionStatus } from "../utils/election";
import "../styles/results.css";

const pickWinner = (electionId, partiesByElection, electionTotalVotes) => {
  const partyList = partiesByElection[electionId] || [];
  if (partyList.length === 0) {
    return {
      winner: null,
      runnerUp: null,
      totalVotes: Number(electionTotalVotes || 0),
    };
  }

  const sorted = [...partyList].sort((a, b) => b.votes - a.votes);
  const totalVotes =
    Number(electionTotalVotes || 0) ||
    sorted.reduce((sum, party) => sum + party.votes, 0);

  return {
    winner: sorted[0],
    runnerUp: sorted[1] || null,
    totalVotes,
  };
};

export default function Results() {
  const [elections, setElections] = useState([]);
  const [partiesByElection, setPartiesByElection] = useState({});
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
        setElections(electionList);

        const partyListRaw = Array.isArray(partiesRes.data?.data?.parties)
          ? partiesRes.data.data.parties
          : Array.isArray(partiesRes.data?.data)
            ? partiesRes.data.data
            : Array.isArray(partiesRes.data)
              ? partiesRes.data
              : [];

        const grouped = partyListRaw.reduce((acc, party) => {
          const electionId =
            party.electionId?._id?.toString?.() ||
            party.electionId?.toString?.() ||
            "unassigned";
          if (!acc[electionId]) acc[electionId] = [];
          acc[electionId].push({
            id: (party._id || party.id || "").toString(),
            name: party.name || "Unnamed Party",
            short: party.shortName || party.symbol || party.name?.slice(0, 3) || "PRT",
            color: party.color || "#2563eb",
            votes: Number(party.totalVotes || party.currentVotes || 0),
          });
          return acc;
        }, {});

        setPartiesByElection(grouped);
      } catch (error) {
        console.error("Failed to load results:", error?.response?.data || error.message);
        setElections([]);
        setPartiesByElection({});
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const currentElection = useMemo(
    () =>
      elections
        .filter((election) => normalizeElectionStatus(election) === "running")
        .sort((a, b) => new Date(a.endDate || 0) - new Date(b.endDate || 0))[0] ||
      null,
    [elections],
  );

  const pastResults = useMemo(
    () =>
      elections
        .filter((election) => normalizeElectionStatus(election) === "ended")
        .sort((a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0)),
    [elections],
  );

  return (
    <div>
      <div className="results-header">
        <h1>Election Results</h1>
        <p>Published results and winner summaries from completed elections.</p>
      </div>

      <div className="results-current">
        <div>
          <h2>{currentElection?.title || "No election running right now"}</h2>
          <div className="results-current-status">
            <span />
            <p>
              {currentElection
                ? `Live election ends ${formatDateTime(currentElection.endDate)}`
                : "Live updates resume once next election starts"}
            </p>
          </div>
        </div>

        <div className="results-current-right">
          <div className="results-current-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </div>
          <p>
            {currentElection
              ? `${currentElection.totalVotes || 0} votes so far`
              : "Waiting for schedule"}
          </p>
        </div>
      </div>

      <div className="results-section">
        <h3>Past Election Results</h3>
        <p>Final winners and vote margins based on backend records.</p>

        {loading ? <p style={{ marginTop: 16 }}>Loading results...</p> : null}
        {!loading && pastResults.length === 0 ? (
          <p style={{ marginTop: 16 }}>No completed elections available yet.</p>
        ) : null}

        {pastResults.map((election) => {
          const electionId = (election._id || election.id || "").toString();
          const { winner, runnerUp, totalVotes } = pickWinner(
            electionId,
            partiesByElection,
            election.totalVotes,
          );
          const winnerVotes = Number(winner?.votes || 0);
          const runnerVotes = Number(runnerUp?.votes || 0);
          const marginVotes = Math.max(0, winnerVotes - runnerVotes);
          const winnerShare =
            totalVotes > 0 ? `${((winnerVotes / totalVotes) * 100).toFixed(1)}%` : "0.0%";

          return (
            <div key={electionId} className="result-card">
              <div className="result-card-header">
                <div>
                  <h4>{election.title || "Election"}</h4>
                  <span>{formatDate(election.endDate)}</span>
                </div>
                <div className="result-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Result Published
                </div>
              </div>

              <div className="result-body">
                <div className="result-winner">
                  <div className="result-logo" style={{ background: winner?.color || "#2563eb" }}>
                    <span>{winner?.short || "N/A"}</span>
                  </div>

                  <div className="result-info">
                    <h5>{winner?.name || "Winner unavailable"}</h5>
                    <p>{runnerUp ? `Runner-up: ${runnerUp.name}` : "Runner-up data unavailable"}</p>
                  </div>
                </div>

                <div className="result-stats">
                  <div>
                    <span>Winner Votes</span>
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
                  <span>Winning Margin</span>
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
