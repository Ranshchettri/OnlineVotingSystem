import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { getPartyShortLabel } from "../../shared/utils/partyDisplay";
import { getTimeLeft, normalizeElectionStatus, pickCurrentElection } from "../utils/election";
import "../styles/results.css";

const resolveElectionStandings = (election, standingsByElection) => {
  const electionId = (election._id || election.id || "").toString();
  const electionBundle = standingsByElection[electionId] || {};
  const standings = Array.isArray(electionBundle.parties) ? electionBundle.parties : [];

  if (standings.length === 0) {
    return {
      winner: null,
      runnerUp: null,
      totalVotes: Number(election.totalVotes || 0),
      winnerVotes: 0,
      marginVotes: 0,
      winnerShare: "0.0%",
      winnerSeats: 0,
      totalSeats: Number(electionBundle.totalSeats || election.totalSeats || 0),
      majority: electionBundle.majority || null,
      coalitionSuggestions: Array.isArray(electionBundle.coalitionSuggestions)
        ? electionBundle.coalitionSuggestions
        : [],
      electionSystem:
        electionBundle.electionSystem || election.electionSystem || "FPTP",
    };
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
    winnerSeats: Number(winner?.seats || 0),
    totalSeats: Number(electionBundle.totalSeats || election.totalSeats || 0),
    majority: electionBundle.majority || null,
    coalitionSuggestions: Array.isArray(electionBundle.coalitionSuggestions)
      ? electionBundle.coalitionSuggestions
      : [],
    electionSystem:
      electionBundle.electionSystem || election.electionSystem || "FPTP",
  };
};

export default function Results() {
  const [elections, setElections] = useState([]);
  const [standingsByElection, setStandingsByElection] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const electionsRes = await api.get("/elections");

        const electionList = Array.isArray(electionsRes.data?.data)
          ? electionsRes.data.data
          : Array.isArray(electionsRes.data)
            ? electionsRes.data
            : [];

        setElections(electionList);

        const electionIds = electionList
          .map((election) => (election._id || election.id || "").toString())
          .filter(Boolean);

        if (electionIds.length === 0) {
          setStandingsByElection({});
          return;
        }

        const standingsEntries = await Promise.all(
          electionIds.map(async (id) => {
            try {
              const response = await api.get(`/results/party/${id}`);
              const data = response.data?.data || {};
              return [
                id,
                {
                  parties: Array.isArray(data.parties) ? data.parties : [],
                  totalSeats: Number(data.totalSeats || 0),
                  majority: data.majority || null,
                  coalitionSuggestions: Array.isArray(data.coalitionSuggestions)
                    ? data.coalitionSuggestions
                    : [],
                  electionSystem: data.electionSystem || "",
                },
              ];
            } catch {
              return [
                id,
                {
                  parties: [],
                  totalSeats: 0,
                  majority: null,
                  coalitionSuggestions: [],
                  electionSystem: "",
                },
              ];
            }
          }),
        );

        setStandingsByElection(Object.fromEntries(standingsEntries));
      } catch (error) {
        console.error("Failed to load results:", error?.response?.data || error.message);
        setElections([]);
        setStandingsByElection({});
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
            winnerSeats,
            totalSeats,
            majority,
            coalitionSuggestions,
            electionSystem,
          } = resolveElectionStandings(election, standingsByElection);

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
                <div className="result-system-tag">{electionSystem || "FPTP"}</div>
                {winner ? (
                  <>
                    <div className="result-winner">
                      <div className="result-logo" style={{ background: winner?.color || "#2563eb" }}>
                        {winner?.logo ? (
                          <img src={winner.logo} alt={winner.name} className="result-logo-img" />
                        ) : (
                          <span>{getPartyShortLabel(winner, "N/A")}</span>
                        )}
                      </div>

                      <div className="result-info">
                        <h5>{winner?.name || "Winner unavailable"}</h5>
                        <p>{runnerUp ? `Runner-up: ${runnerUp.name}` : "Runner-up data unavailable"}</p>
                        <p>Seats: {winnerSeats} / {Number(totalSeats || 0)}</p>
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

                      <div className="result-divider" />

                      <div>
                        <span>Seats Won</span>
                        <strong>{Number(winnerSeats || 0)}</strong>
                        <small>Total Seats: {Number(totalSeats || 0)}</small>
                      </div>
                    </div>

                    <div className="result-margin">
                      <span>Victory Margin</span>
                      <strong>{marginVotes.toLocaleString()} votes</strong>
                    </div>

                    {majority?.type === "Coalition Required" && coalitionSuggestions.length > 0 ? (
                      <div className="result-coalitions">
                        <span>Possible Coalitions</span>
                        <ul>
                          {coalitionSuggestions.slice(0, 3).map((entry, idx) => (
                            <li key={`${entry.partyNames?.join("-") || idx}`}>
                              {(entry.partyNames || []).join(" + ")} ({Number(entry.totalSeats || 0)} seats)
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="result-empty">
                    <p>No recorded party votes found for this election.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
