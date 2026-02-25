import { useEffect, useState } from "react";
import api from "../../services/api";
import { getStoredVoter } from "../utils/user";
import "../styles/profile.css";

export default function Profile() {
  const stored = getStoredVoter();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get("/votes/me");
        setHistory(res.data?.data || res.data || []);
      } catch {
        setHistory([]);
      }
    };
    loadHistory();
  }, []);

  const photo =
    stored?.profilePhoto ||
    stored?.photoUrl ||
    "https://i.pravatar.cc/160?u=voter";

  return (
    <div className="profile-page">
      <div className="profile-title">
        <h1>My Profile</h1>
        <p>Manage your voter identity and review voting activity.</p>
      </div>

      <div className="profile-main-card">
        <div className="profile-hero">
          <div className="profile-hero-photo">
            {photo ? <img src={photo} alt="Voter" /> : <div className="profile-hero-placeholder" />}
          </div>
          <div className="profile-hero-info">
            <h2>{stored?.fullName || "Registered Voter"}</h2>
            <p>
              <i className="ri-mail-line" aria-hidden="true" />
              {stored?.email || "Not provided"}
            </p>
            <div className="profile-hero-badge">
              <i className="ri-checkbox-circle-line" aria-hidden="true" />
              {stored ? "Verified Voter" : "Guest"}
            </div>
          </div>
        </div>

        <div className="profile-info">
          <h3>Identity Details</h3>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>Voter ID</span>
              <strong>{stored?.voterId || "—"}</strong>
            </div>
            <div className="profile-info-item">
              <span>Mobile</span>
              <strong>{stored?.mobile || "—"}</strong>
            </div>
            <div className="profile-info-item">
              <span>Status</span>
              <strong>{stored ? "ACTIVE" : "GUEST"}</strong>
            </div>
            <div className="profile-info-item">
              <span>Last Updated</span>
              <strong>{new Date().toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-history-card">
        <div className="profile-history-header">
          <h3>Voting History</h3>
          <p>Latest ballots cast with this voter ID.</p>
        </div>

        <div className="profile-history-list">
          {history.length === 0 ? (
            <div className="profile-history-item">
              <div className="profile-history-top">
                <h4>No votes recorded yet.</h4>
              </div>
              <div className="profile-history-grid">
                <span>Cast your first vote to see history here.</span>
              </div>
            </div>
          ) : (
            history.map((item) => (
              <div key={item._id} className="profile-history-item">
                <div className="profile-history-top">
                  <div>
                    <h4>{item.electionName || "Election"}</h4>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="profile-history-badge">
                    <i className="ri-vote-line" aria-hidden="true" />
                    Submitted
                  </div>
                </div>
                <div className="profile-history-grid">
                  <div>
                    <span>Party</span>
                    <strong>{item.partyName || "—"}</strong>
                  </div>
                  <div>
                    <span>Ballot ID</span>
                    <strong>{item._id}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
