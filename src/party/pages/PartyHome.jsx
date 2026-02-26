import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/home.css";

const clone = (value) => JSON.parse(JSON.stringify(value));
const defaults = {
  title: "Party Profile",
  subtitle: "Manage your party information",
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
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const normalizeTeamForUi = (team = []) =>
    team.map((m, idx) => ({
      ...m,
      id: m.id || `${m.name || "member"}-${idx}`,
      name: String(m.name || "").trim(),
      role: m.role || m.position || "",
      photo: m.photo || "",
    }));

  const normalizeTeamForApi = (team = []) =>
    team
      .map((m) => ({
        name: String(m.name || "").trim(),
        role: String(m.role || "").trim(),
        position: String(m.position || m.role || "").trim(),
        photo: m.photo || "",
      }))
      .filter((m) => Boolean(m.name));

  useEffect(() => {
    const loadParty = async () => {
      try {
        const res = await api.get("/parties/profile/full");
        const party = res.data?.data || {};
        const mapped = {
          name: party.name || "",
          leader: party.leader || "",
          vision: party.vision || party.mission || "",
          logoImage: party.logo || "",
          team: normalizeTeamForUi(party.teamMembers || []),
        };
        setSaved(mapped);
        setIsLocked(Boolean(party.isEditingLocked));
        if (party.isEditingLocked && isEditing) {
          setIsEditing(false);
          setSaveMessage("Editing is locked within 24 hours of election start.");
        }
        if (!isEditing) {
          setDraft(clone(mapped));
        }
      } catch (err) {
        console.error("Failed to load party data", err.message);
      }
    };
    loadParty();
    const interval = setInterval(() => {
      if (!isEditing) loadParty();
    }, 30000);
    return () => clearInterval(interval);
  }, [isEditing]);

  const startEdit = () => {
    if (isLocked) {
      setSaveMessage("Editing is locked within 24 hours of election start.");
      return;
    }
    setDraft(clone(saved));
    setSaveMessage("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(clone(saved));
    setSaveMessage("");
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (isLocked) {
      setSaveMessage("Editing is locked within 24 hours of election start.");
      return;
    }

    const next = clone(draft);
    const invalidMember = (next.team || []).find(
      (member) => (member.role || member.photo) && !String(member.name || "").trim(),
    );

    if (invalidMember) {
      setSaveMessage("Team member name is required when role or photo is provided.");
      return;
    }

    const teamMembers = normalizeTeamForApi(next.team || []);

    try {
      setSaving(true);
      setSaveMessage("");
      await api.put("/parties/profile/full", {
        name: next.name,
        leader: next.leader,
        vision: next.vision,
        manifesto: next.vision,
        logo: next.logoImage,
        teamMembers,
      });

      const synced = {
        ...next,
        team: normalizeTeamForUi(teamMembers),
      };
      setSaved(synced);
      setDraft(clone(synced));
      setIsEditing(false);
      setSaveMessage("Profile saved successfully.");
    } catch (err) {
      console.error("Failed to save party profile", err.message);
      setSaveMessage(err.response?.data?.message || "Failed to save party profile.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogo = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateField("logoImage", reader.result);
    };
    reader.readAsDataURL(file);
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
    const reader = new FileReader();
    reader.onload = () => {
      updateMember(id, "photo", reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="party-page party-home-page">
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
              disabled={saving || isLocked}
            >
              {isLocked ? "Editing Locked" : saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <button
            className="party-edit-btn"
            type="button"
            onClick={startEdit}
            disabled={isLocked}
            title={isLocked ? "Editing is locked before election start" : "Edit profile"}
          >
            <i className="ri-edit-line" aria-hidden="true" />
            {isLocked ? "Editing Locked" : "Edit Profile"}
          </button>
        )}
      </div>
      {saveMessage ? <div className="party-home-message">{saveMessage}</div> : null}

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
                    disabled={isLocked}
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
                  disabled={isLocked}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Party Name"
                />
                <input
                  value={draft.leader}
                  disabled={isLocked}
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
              <i className="ri-shield-line" aria-hidden="true" />
              Verified Party
            </span>
          </div>
        </div>
        <div className="party-profile-body">
          <h3>Vision &amp; Motivation</h3>
          {isEditing ? (
            <textarea
              value={draft.vision}
              disabled={isLocked}
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
              disabled={isLocked}
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
                      disabled={isLocked}
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
                    disabled={isLocked}
                    placeholder="Member Name"
                    onChange={(event) =>
                      updateMember(member.id, "name", event.target.value)
                    }
                  />
                  <input
                    value={member.role}
                    disabled={isLocked}
                    placeholder="Role / Bio"
                    onChange={(event) =>
                      updateMember(member.id, "role", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="party-btn danger"
                    disabled={isLocked}
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
