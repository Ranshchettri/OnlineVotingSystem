import { profileDetails, votingHistory } from "../data/fakeVoterData";
import "../styles/profile.css";

const infoFields = [
  { label: "Date of Birth", value: profileDetails.dob },
  { label: "Email Address", value: profileDetails.email },
  { label: "Mobile Number", value: profileDetails.phone },
  { label: "District", value: profileDetails.district },
  { label: "Province", value: profileDetails.province },
];

export default function Profile() {
  return (
    <div className="profile-page">
      <div className="profile-title">
        <h1>My Profile</h1>
        <p>Your voter information and history</p>
      </div>

      <div className="profile-main-card">
        <div className="profile-hero">
          <div className="profile-hero-photo">
            {profileDetails.photo ? (
              <img src={profileDetails.photo} alt={profileDetails.name} />
            ) : (
              <div className="profile-hero-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c1.6-4 5-6 8-6s6.4 2 8 6" />
                </svg>
              </div>
            )}
          </div>
          <div className="profile-hero-info">
            <h2>{profileDetails.name}</h2>
            <p>
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l7 6h-2v12H7V8H5l7-6z" />
                </svg>
              </span>
              Voter ID: {profileDetails.id}
            </p>
            <span className="profile-hero-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6l-8 8-4-4" />
              </svg>
              Verified Voter
            </span>
          </div>
        </div>

        <div className="profile-info">
          <h3>Personal Information</h3>
          <div className="profile-info-grid">
            {infoFields.map((field) => (
              <div key={field.label} className="profile-info-item">
                <span>{field.label}</span>
                <strong>{field.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="profile-history-card">
        <div className="profile-history-header">
          <h3>Voting History</h3>
          <p>Your participation in the last 5 elections</p>
        </div>

        <div className="profile-history-list">
          {votingHistory.map((entry) => (
            <div key={entry.id} className="profile-history-item">
              <div className="profile-history-top">
                <div>
                  <h4>{entry.title}</h4>
                  <span>Year: {entry.year}</span>
                </div>
                {entry.won ? (
                  <span className="profile-history-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 21h8" />
                      <path d="M12 17v4" />
                      <path d="M7 4h10v4H7z" />
                      <path d="M6 8h12l-1 5H7z" />
                    </svg>
                    Your Vote Won
                  </span>
                ) : null}
              </div>

              <div className="profile-history-grid">
                <div>
                  <span>You Voted For</span>
                  <strong>{entry.votedFor}</strong>
                </div>
                <div>
                  <span>Winner</span>
                  <strong>{entry.winner}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
