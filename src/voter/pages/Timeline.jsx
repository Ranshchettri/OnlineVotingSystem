import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  formatDate,
  formatTime,
  getTimeLeft,
  normalizeElectionStatus,
} from "../utils/election";
import "../styles/timeline.css";

export default function Timeline() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/elections");
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        setElections(list);
      } catch (error) {
        console.error("Failed to load timeline:", error?.response?.data || error.message);
        setElections([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeElection = useMemo(
    () =>
      elections
        .filter((election) => normalizeElectionStatus(election) === "running")
        .sort((a, b) => new Date(a.endDate || 0) - new Date(b.endDate || 0))[0] ||
      null,
    [elections],
  );

  const upcomingElections = useMemo(
    () =>
      elections
        .filter((election) => normalizeElectionStatus(election) === "upcoming")
        .sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0)),
    [elections],
  );

  return (
    <div>
      <div className="timeline-header">
        <h1>Election Timeline</h1>
        <p>Current and upcoming election schedules</p>
      </div>

      {activeElection ? (
        <div className="timeline-active">
          <div className="timeline-active-label">
            <span />
            <p>CURRENTLY ACTIVE</p>
          </div>
          <h2>{activeElection.title}</h2>
          <p>Election Type: {activeElection.type || "Election"}</p>

          <div className="timeline-dates">
            <div className="timeline-date-card">
              <h4>Start Date & Time</h4>
              <strong>{formatDate(activeElection.startDate)}</strong>
              <span>{formatTime(activeElection.startDate)}</span>
            </div>
            <div className="timeline-date-card">
              <h4>End Date & Time</h4>
              <strong>{formatDate(activeElection.endDate)}</strong>
              <span>{formatTime(activeElection.endDate)}</span>
            </div>
          </div>

          <div className="timeline-remaining">
            <div className="timeline-remaining-left">
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </span>
              <div>
                <p>Time Remaining</p>
                <strong>{getTimeLeft(activeElection.endDate)}</strong>
              </div>
            </div>
            <div className="timeline-remaining-action">
              <p>Don't forget to vote!</p>
              <button
                type="button"
                className="timeline-cta"
                onClick={() => navigate("/voter/dashboard")}
              >
                Vote Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="timeline-active">
          <div className="timeline-active-label">
            <span />
            <p>No active election</p>
          </div>
          <h2>Waiting for next schedule</h2>
          <p>Once admins activate an election, it will appear here automatically.</p>
        </div>
      )}

      <div className="timeline-section">
        <h3>Upcoming Elections</h3>
        <p>Scheduled elections for the coming year.</p>

        {loading ? <p style={{ marginTop: 16 }}>Loading timeline...</p> : null}
        {!loading && upcomingElections.length === 0 ? (
          <p style={{ marginTop: 16 }}>No upcoming elections scheduled.</p>
        ) : null}

        <div className="timeline-upcoming-list">
          {upcomingElections.map((election) => (
            <div key={election._id || election.id} className="timeline-upcoming-card">
              <div className="timeline-upcoming-head">
                <div>
                  <h4>{election.title || "Election"}</h4>
                  <p>{election.type || "General"}</p>
                </div>
                <span className="timeline-status">Scheduled</span>
              </div>

              <div className="timeline-date-grid">
                <div className="timeline-date-box">
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </span>
                  <div>
                    <p>Starts</p>
                    <strong>{formatDate(election.startDate)}</strong>
                    <small>{formatTime(election.startDate)}</small>
                  </div>
                </div>
                <div className="timeline-date-box">
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </span>
                  <div>
                    <p>Ends</p>
                    <strong>{formatDate(election.endDate)}</strong>
                    <small>{formatTime(election.endDate)}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="timeline-mail">
        <h4>Notification Reminder</h4>
        <p>System sends reminders automatically on election day:</p>
        <ul>
          <li>At start time when election opens</li>
          <li>One hour before election closes</li>
          <li>After vote submission confirmation</li>
        </ul>
      </div>
    </div>
  );
}
