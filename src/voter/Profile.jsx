import { useEffect, useState } from "react";
import { getVoterProfile, getVoterVoteHistory } from "../api/voterApi";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getVoterProfile(), getVoterVoteHistory()])
      .then(([pRes, hRes]) => {
        setProfile(pRes.data?.data || pRes.data);
        const histData = hRes.data?.data || hRes.data || [];
        setHistory(Array.isArray(histData) ? histData : []);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setProfile(null);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading profile...</p>;
  if (!profile) return <p className="error">Failed to load profile</p>;

  return (
    <div>
      <h2>Your Profile</h2>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3>Voter Information</h3>
        <p>
          <strong>Name:</strong> {profile.name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {profile.email || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong> {profile.phone || "N/A"}
        </p>
        <p>
          <strong>Voter ID:</strong> {profile.voterId || "N/A"}
        </p>
        <p>
          <strong>Status:</strong> {profile.status || "Active"}
        </p>
      </div>

      {history && history.length > 0 && (
        <div className="card">
          <h3>Vote History</h3>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Election</th>
                <th>Party Voted</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((vote, idx) => (
                <tr key={idx}>
                  <td>{vote.electionTitle || "N/A"}</td>
                  <td>{vote.partyName || "N/A"}</td>
                  <td>
                    {vote.votedAt
                      ? new Date(vote.votedAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
