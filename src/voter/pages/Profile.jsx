import { profileDetails, votingHistory } from "../data/fakeVoterData";
import "../styles/profile.css";

const infoFields = [
  { label: "Date of Birth", value: profileDetails.dob },
  { label: "Email Address", value: profileDetails.email },
  { label: "Mobile Number", value: profileDetails.phone },
  { label: "District", value: profileDetails.district },
  { label: "Province", value: profileDetails.province },
  { label: "Voter ID", value: profileDetails.id },
];

export default function Profile() {
  return (
    <div>
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Your voter information and history</p>
      </div>

      <div className="profile-hero">
        <div className="profile-photo">
          {profileDetails.photo ? (
            <img src={profileDetails.photo} alt={profileDetails.name} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.6-4 5-6 8-6s6.4 2 8 6" />
            </svg>
          )}
        </div>
        <div>
          <div className="profile-name">{profileDetails.name}</div>
          <div className="profile-id">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l7 6h-2v12H7V8H5l7-6z" />
            </svg>
            Voter ID: {profileDetails.id}
          </div>
          <span className="profile-verified">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6l-8 8-4-4" />
            </svg>
            {profileDetails.status}
          </span>
        </div>
      </div>

      <div className="profile-card">
        <h2>Personal Information</h2>
        <div className="profile-info-grid">
          {infoFields.map((field) => (
            <div key={field.label} className="profile-info-item">
              <span>{field.label}</span>
              <strong>{field.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-card">
        <h2>Past Elections</h2>
        <div className="profile-history">
          {votingHistory.map((entry) => (
            <div key={entry.year} className="profile-history-card">
              <div className="profile-year">{entry.year}</div>
              <div className="profile-history-main">
                <h3>{entry.election}</h3>
                <p>You Voted For: {entry.votedParty}</p>
                <p>Winner: {entry.winner}</p>
              </div>
              <span
                className={`profile-history-badge ${
                  entry.won ? "success" : "neutral"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {entry.won ? (
                    <path d="M20 6l-8 8-4-4" />
                  ) : (
                    <path d="M6 6l12 12M18 6l-12 12" />
                  )}
                </svg>
                {entry.won ? "Your Vote Won" : "Vote Lost"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
