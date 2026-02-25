import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/home.css";

const clone = (value) => JSON.parse(JSON.stringify(value));
const defaults = {
  title: "Party Dashboard",
  subtitle: "Manage your party profile and team",
  logoBg: "#e5e7eb",
  logoText: "P",
};

export default function PartyHome() {
  const [saved, setSaved] = useState({
    name: "",
    leader: "",
    vision: "",
    logoImage: "",
    team: [],
  });
  const [draft, setDraft] = useState(() => clone(saved));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadParty = async () => {
      try {
        const res = await api.get("/parties");
        const party = (res.data?.data || res.data || [])[0] || {};
        const mapped = {
          name: party.name || "",
          leader: party.leader || "",
          vision: party.vision || party.mission || "",
          logoImage: party.logoUrl || party.logo || "",
          team: (party.teamMembers || []).map((m, idx) => ({
            ...m,
            id: `${m.name || "member"}-${idx}`,
            photo: m.photo || "",
          })),
        };
        setSaved(mapped);
        setDraft(clone(mapped));
      } catch (err) {
        console.error("Failed to load party data", err.message);
      }
    };
    loadParty();
  }, []);

  const startEdit = () => {
    setDraft(clone(saved));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(clone(saved));
    setIsEditing(false);
  };

  const saveEdit = () => {
    setSaved(clone(draft));
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogo = (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    updateField("logoImage", preview);
  };

  const updateMember = (id, field, value) => {
    setDraft((prev) => ({
      ...prev,
      team: prev.team.map((member) =>
        member.id === id ? { ...member, [field]: value } : member,
      ),
    }));
  };

  const addMember = () => {
    setDraft((prev) => ({
      ...prev,
      team: [
        ...prev.team,
        {
          id: `new-${Date.now()}`,
          name: "",
          role: "",
          initials: "NM",
          tone: "#f8fafc",
          photo: "",
        },
      ],
    }));
  };

  const removeMember = (id) => {
    setDraft((prev) => ({
      ...prev,
      team: prev.team.filter((member) => member.id !== id),
    }));
  };

  const handlePhoto = (id, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    updateMember(id, "photo", preview);
  };

  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>{defaults.title}</h1>
          <p>{defaults.subtitle}</p>
        </div>
        {isEditing ? (
          <div className="party-header-actions">
            <button
              type="button"
              className="party-btn ghost"
              onClick={cancelEdit}
            >
              Cancel
            </button>
            <button
              type="button"
              className="party-btn primary"
              onClick={saveEdit}
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button className="party-edit-btn" type="button" onClick={startEdit}>
            <i className="ri-edit-line" aria-hidden="true" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="party-profile-card">
        <div className="party-profile-hero">
          <div
            className="party-profile-logo"
            style={{ background: defaults.logoBg }}
          >
            {isEditing ? (
              <>
                {draft.logoImage ? (
                  <img src={draft.logoImage} alt="Party logo" />
                ) : (
                  <span>{defaults.logoText}</span>
                )}
                <label className="party-logo-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleLogo(event.target.files[0])}
                  />
                  <i className="ri-upload-cloud-line" aria-hidden="true" />
                  Upload Logo
                </label>
              </>
            ) : saved.logoImage ? (
              <img src={saved.logoImage} alt="Party logo" />
            ) : (
              <span>{defaults.logoText}</span>
            )}
          </div>
          <div className="party-profile-info">
            {isEditing ? (
              <div className="party-profile-inputs">
                <input
                  value={draft.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Party Name"
                />
                <input
                  value={draft.leader}
                  onChange={(event) =>
                    updateField("leader", event.target.value)
                  }
                  placeholder="Leader Name"
                />
              </div>
            ) : (
              <>
                <h2>{saved.name}</h2>
                <p>Leader: {saved.leader}</p>
              </>
            )}
            <span className="party-profile-badge">
              <i className="ri-checkbox-circle-line" aria-hidden="true" />
              Verified Party
            </span>
          </div>
        </div>
        <div className="party-profile-body">
          <h3>Vision &amp; Motivation</h3>
          {isEditing ? (
            <textarea
              value={draft.vision}
              onChange={(event) => updateField("vision", event.target.value)}
            />
          ) : (
            <p>{saved.vision}</p>
          )}
        </div>
      </div>

      <div className="party-team party-card">
        <div className="party-team-head">
          <h3>Team Members</h3>
          {isEditing ? (
            <button
              type="button"
              className="party-btn outline"
              onClick={addMember}
            >
              <i className="ri-add-line" aria-hidden="true" />
              Add Member
            </button>
          ) : null}
        </div>
        <div className="party-team-grid">
          {(isEditing ? draft.team : saved.team).map((member) => (
            <div key={member.id} className="party-team-card">
              <div className="party-team-photo">
                {member.photo ? (
                  <img src={member.photo} alt={member.name || "Team member"} />
                ) : (
                  <span>{member.initials}</span>
                )}
                {isEditing ? (
                  <label className="party-photo-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handlePhoto(member.id, event.target.files[0])
                      }
                    />
                    Upload
                  </label>
                ) : null}
              </div>
              {isEditing ? (
                <div className="party-team-edit">
                  <input
                    value={member.name}
                    placeholder="Member Name"
                    onChange={(event) =>
                      updateMember(member.id, "name", event.target.value)
                    }
                  />
                  <input
                    value={member.role}
                    placeholder="Role / Bio"
                    onChange={(event) =>
                      updateMember(member.id, "role", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="party-btn danger"
                    onClick={() => removeMember(member.id)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="party-team-name">{member.name}</div>
                  <div className="party-team-role">{member.role}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="party-notice">
        <div className="party-notice-head">
          <span>!</span>
          <strong>Important Notice</strong>
        </div>
        <p>
          Profile editing will be locked 24 hours before the election starts.
          Please ensure all information is accurate and up-to-date.
        </p>
      </div>
    </div>
  );
}
