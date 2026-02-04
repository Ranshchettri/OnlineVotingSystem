import {
  timelineActive,
  upcomingElections,
  notificationSettings,
} from "../data/fakeVoterData";
import "../styles/timeline.css";

export default function Timeline() {
  return (
    <div>
      <div className="timeline-header">
        <h1>Election Timeline</h1>
        <p>Current and upcoming election schedules</p>
      </div>

      <div className="timeline-active">
        <div className="timeline-active-label">
          <span />
          CURRENTLY ACTIVE
        </div>
        <h2>{timelineActive.title}</h2>
        <p>Election Type: {timelineActive.type}</p>

        <div className="timeline-dates">
          <div className="timeline-date-card">
            <h4>Start Date &amp; Time</h4>
            <strong>{timelineActive.startDate}</strong>
            <span>{timelineActive.startTime}</span>
          </div>
          <div className="timeline-date-card">
            <h4>End Date &amp; Time</h4>
            <strong>{timelineActive.endDate}</strong>
            <span>{timelineActive.endTime}</span>
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
              <div>Time Remaining</div>
              <strong>{timelineActive.remaining}</strong>
            </div>
          </div>
          <div className="timeline-remaining-action">
            <div>Don&apos;t forget to vote!</div>
            <button className="timeline-cta" type="button">
              Vote Now
            </button>
          </div>
        </div>
      </div>

      <div className="timeline-section">
        <h3>Upcoming Elections</h3>
        <p>Scheduled elections for the coming year</p>

        <div className="timeline-upcoming-list">
          {upcomingElections.map((election) => (
            <div key={election.id} className="timeline-upcoming-card">
              <div className="timeline-upcoming-head">
                <div>
                  <h4>{election.title}</h4>
                  <p>Type: {election.type}</p>
                </div>
                <span className="timeline-status">{election.status}</span>
              </div>

              <div className="timeline-date-grid">
                <div className="timeline-date-box">
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M3 10h18" />
                    </svg>
                  </span>
                  <div>
                    <div>Start</div>
                    <strong>{election.startDate}</strong>
                    <small>{election.startTime}</small>
                  </div>
                </div>
                <div className="timeline-date-box">
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M3 10h18" />
                    </svg>
                  </span>
                  <div>
                    <div>End</div>
                    <strong>{election.endDate}</strong>
                    <small>{election.endTime}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="timeline-mail">
          <h4>Email Notifications Enabled</h4>
          <p>You will receive email notifications for:</p>
          <ul>
            {notificationSettings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
