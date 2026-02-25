import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { getStoredVoter } from "../utils/user";
import { formatDate, formatDateTime } from "../utils/election";
import "../styles/profile.css";

export default function Profile() {
  const stored = getStoredVoter();
  const [profile, setProfile] = useState(stored || null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const [profileRes, historyRes] = await Promise.all([
          api.get("/auth/me").catch(() => ({ data: { data: null } })),
          api.get("/votes/me").catch(() => ({ data: { data: [] } })),
        ]);

        const realProfile = profileRes.data?.data || null;
        if (realProfile) {
          setProfile(realProfile);
          localStorage.setItem(
            "voter",
            JSON.stringify({
              ...(stored || {}),
              ...realProfile,
            }),
          );
        }

        const voteHistory = Array.isArray(historyRes.data?.data)
          ? historyRes.data.data
          : Array.isArray(historyRes.data)
            ? historyRes.data
            : [];
        setHistory(voteHistory);
      } catch (error) {
        console.error("Failed to load profile:", error?.response?.data || error.message);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const displayProfile = profile || stored || {};
  const photo =
    displayProfile.profilePhoto ||
    displayProfile.photoUrl ||
    "https://i.pravatar.cc/160?u=voter";
  const voterId =
    displayProfile.voterId || displayProfile.voterIdNumber || "N/A";
  const verificationStatus = String(
    displayProfile.verificationStatus ||
      (displayProfile.isVerified || displayProfile.verified ? "auto-approved" : "pending"),
  )
    .replace("-", " ")
    .toUpperCase();
  const updatedAt = displayProfile.updatedAt
    ? formatDateTime(displayProfile.updatedAt)
    : "N/A";

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      ),
    [history],
  );

  return (
    <div className="profile-page">
      <div className="profile-title">
        <h1>My Profile</h1>
        <p>Live voter identity details from backend profile records.</p>
      </div>

      <div className="profile-main-card">
        <div className="profile-hero">
          <div className="profile-hero-photo">
            {photo ? (
              <img src={photo} alt="Voter" />
            ) : (
              <div className="profile-hero-placeholder" />
            )}
          </div>
          <div className="profile-hero-info">
            <h2>{displayProfile.fullName || "Registered Voter"}</h2>
            <p>
              <i className="ri-mail-line" aria-hidden="true" />
              {displayProfile.email || "N/A"}
            </p>
            <div className="profile-hero-badge">
              <i className="ri-checkbox-circle-line" aria-hidden="true" />
              {verificationStatus}
            </div>
          </div>
        </div>

        <div className="profile-info">
          <h3>Identity Details</h3>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>Voter ID</span>
              <strong>{voterId}</strong>
            </div>
            <div className="profile-info-item">
              <span>Mobile</span>
              <strong>{displayProfile.mobile || "N/A"}</strong>
            </div>
            <div className="profile-info-item">
              <span>Date of Birth</span>
              <strong>{displayProfile.dateOfBirth ? formatDate(displayProfile.dateOfBirth) : "N/A"}</strong>
            </div>
            <div className="profile-info-item">
              <span>Address</span>
              <strong>{displayProfile.address || "N/A"}</strong>
            </div>
            <div className="profile-info-item">
              <span>Status</span>
              <strong>{verificationStatus}</strong>
            </div>
            <div className="profile-info-item">
              <span>Last Updated</span>
              <strong>{updatedAt}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-history-card">
        <div className="profile-history-header">
          <h3>Voting History</h3>
          <p>Ballots linked to this voter account.</p>
        </div>

        {loading ? <p style={{ marginTop: 16 }}>Loading profile data...</p> : null}

        <div className="profile-history-list">
          {!loading && sortedHistory.length === 0 ? (
            <div className="profile-history-item">
              <div className="profile-history-top">
                <h4>No votes recorded yet.</h4>
              </div>
              <div className="profile-history-grid">
                <span>Cast your first vote to see history here.</span>
              </div>
            </div>
          ) : (
            sortedHistory.map((item) => (
              <div key={item._id} className="profile-history-item">
                <div className="profile-history-top">
                  <div>
                    <h4>{item.electionName || "Election"}</h4>
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                  <div className="profile-history-badge">
                    <i className="ri-vote-line" aria-hidden="true" />
                    Submitted
                  </div>
                </div>
                <div className="profile-history-grid">
                  <div>
                    <span>Party</span>
                    <strong>{item.partyName || "N/A"}</strong>
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
