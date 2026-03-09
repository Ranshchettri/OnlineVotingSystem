import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { getStoredVoter } from "../utils/user";
import { formatDate, formatDateTime } from "../utils/election";
import "../styles/profile.css";

const deriveDistrict = (profile) => {
  if (profile?.district) return profile.district;
  if (!profile?.address) return "-";
  const parts = String(profile.address).split(",").map((item) => item.trim());
  return parts[0] || "-";
};

const deriveProvince = (profile) => {
  if (profile?.province) return profile.province;
  if (!profile?.address) return "-";
  const parts = String(profile.address).split(",").map((item) => item.trim());
  return parts[1] || "-";
};

export default function Profile() {
  const stored = useMemo(() => getStoredVoter(), []);
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
        if (realProfile?.role === "voter") {
          setProfile(realProfile);
        } else {
          setProfile(stored || null);
        }

        const voteHistory = Array.isArray(historyRes.data?.data)
          ? historyRes.data.data
          : Array.isArray(historyRes.data)
            ? historyRes.data
            : [];

        const electionIds = [
          ...new Set(
            voteHistory
              .filter((item) => Boolean(item?.election?.resultsPublishedAt))
              .map((item) => String(item.electionId || ""))
              .filter(Boolean),
          ),
        ];
        const standingEntries = await Promise.all(
          electionIds.map(async (id) => {
            try {
              const standingsRes = await api.get(`/results/party/${id}`);
              const parties = Array.isArray(standingsRes.data?.data?.parties)
                ? standingsRes.data.data.parties
                : [];
              return [id, parties];
            } catch {
              return [id, []];
            }
          }),
        );
        const standingsByElection = Object.fromEntries(standingEntries);

        const enrichedHistory = voteHistory.map((item) => {
          const electionId = String(item.electionId || "");
          const electionStatus = String(item?.election?.status || "").toLowerCase();
          const isResultFinal =
            Boolean(item?.election?.resultsPublishedAt) &&
            (Boolean(item?.election?.isEnded) || electionStatus === "ended");
          const standings = Array.isArray(standingsByElection[electionId])
            ? standingsByElection[electionId]
            : [];
          const winner = isResultFinal ? standings[0] || null : null;
          const votedPartyName = String(item.partyName || "").toLowerCase();
          const winnerName = String(winner?.name || "");
          const voteWon =
            winnerName &&
            votedPartyName &&
            votedPartyName === winnerName.toLowerCase();
          const voteStatusLabel = !isResultFinal
            ? "Vote Submitted"
            : !winnerName
              ? "Result Pending"
              : voteWon
                ? "Your Vote Won"
                : "Your Vote Lost";
          const voteStatusClass =
            !isResultFinal || !winnerName ? "submitted" : voteWon ? "won" : "lost";
          const voteStatusIcon =
            !isResultFinal || !winnerName
              ? "ri-checkbox-circle-line"
              : voteWon
                ? "ri-trophy-line"
                : "ri-close-circle-line";

          return {
            ...item,
            winnerName: isResultFinal ? winnerName || "-" : "-",
            voteWon: Boolean(isResultFinal && voteWon),
            voteStatusLabel,
            voteStatusClass,
            voteStatusIcon,
          };
        });

        setHistory(enrichedHistory);
      } catch (error) {
        console.error("Failed to load profile:", error?.response?.data || error.message);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [stored]);

  const displayProfile = profile || stored || {};
  const photo =
    displayProfile.profilePhoto ||
    displayProfile.photoUrl ||
    "https://i.pravatar.cc/160?u=voter";
  const voterId = displayProfile.voterId || displayProfile.voterIdNumber || "-";
  const rawVerification = String(displayProfile.verificationStatus || "").toLowerCase();
  const isBlocked = ["blocked", "rejected"].includes(rawVerification);
  const badgeText = isBlocked ? rawVerification.toUpperCase() : "Verified Voter";

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
        <p>Your voter information and history</p>
      </div>

      <div className="profile-main-card">
        <div className="profile-hero">
          <div className="profile-hero-photo">
            {photo ? <img src={photo} alt="Voter" /> : <div className="profile-hero-placeholder" />}
          </div>
          <div className="profile-hero-info">
            <h2>{displayProfile.fullName || "Registered Voter"}</h2>
            <p>
              <i className="ri-id-card-line" aria-hidden="true" />
              Voter ID: {voterId}
            </p>
            <div className="profile-hero-badge">
              <i className="ri-shield-check-line" aria-hidden="true" />
              {badgeText}
            </div>
          </div>
        </div>

        <div className="profile-info">
          <h3>Personal Information</h3>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>Date of Birth</span>
              <strong>{displayProfile.dateOfBirth ? formatDate(displayProfile.dateOfBirth) : "-"}</strong>
            </div>
            <div className="profile-info-item">
              <span>Email Address</span>
              <strong>{displayProfile.email || "-"}</strong>
            </div>
            <div className="profile-info-item">
              <span>Mobile Number</span>
              <strong>{displayProfile.mobile || "-"}</strong>
            </div>
            <div className="profile-info-item">
              <span>District</span>
              <strong>{deriveDistrict(displayProfile)}</strong>
            </div>
            <div className="profile-info-item">
              <span>Province</span>
              <strong>{deriveProvince(displayProfile)}</strong>
            </div>
            <div className="profile-info-item">
              <span>Last Updated</span>
              <strong>{displayProfile.updatedAt ? formatDateTime(displayProfile.updatedAt) : "-"}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-history-card">
        <div className="profile-history-header">
          <h3>Voting History</h3>
          <p>Your participation in recent elections</p>
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
            sortedHistory.map((item) => {
              const yearSource =
                item?.election?.endDate ||
                item?.election?.startDate ||
                item?.election?.createdAt ||
                item?.createdAt ||
                null;
              const year =
                yearSource && !Number.isNaN(new Date(yearSource).getTime())
                  ? new Date(yearSource).getFullYear()
                  : "-";
              return (
                <div key={item._id} className="profile-history-item">
                  <div className="profile-history-top">
                    <div>
                      <h4>{item.electionName || "Election"}</h4>
                      <span>Year: {year}</span>
                    </div>
                    <div className={`profile-history-badge ${item.voteStatusClass || "submitted"}`}>
                      <i className={item.voteStatusIcon || "ri-checkbox-circle-line"} aria-hidden="true" />
                      {item.voteStatusLabel || "Vote Submitted"}
                    </div>
                  </div>
                  <div className="profile-history-grid">
                    <div>
                      <span>You Voted For</span>
                      <strong>{item.partyName || "-"}</strong>
                    </div>
                    <div>
                      <span>Winner</span>
                      <strong>{item.winnerName || "-"}</strong>
                    </div>
                    <div>
                      <span>Ballot Time</span>
                      <strong>{item.createdAt ? formatDateTime(item.createdAt) : "-"}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
