import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/home.css";

const clone = (value) => JSON.parse(JSON.stringify(value));
const defaults = {
  title: "Party Dashboard",
  subtitle: "Manage your party information",
  logoBg: "#e5e7eb",
  logoText: "P",
};

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const mapProfileToState = (party = {}) => ({
  name: party.name || "",
  leader: party.leader || "",
  vision: party.vision || party.mission || "",
  logoImage: party.logo || "",
  team: (Array.isArray(party.teamMembers) ? party.teamMembers : []).map((m, idx) => ({
    ...m,
    id: m.id || `${m.name || "member"}-${idx}`,
    name: String(m.name || "").trim(),
    role: m.role || m.position || "",
    photo: m.photo || "",
  })),
  establishedDate: toInputDate(party.establishedDate),
  headquarters: party.headquarters || "",
  totalMembers: Number(party.totalMembers || 0),
  electionWins: Number(party.electionWins || 0),
  gallery: Array.isArray(party.gallery) ? party.gallery : [],
  contact: {
    address: party.contact?.address || "",
    phone: party.contact?.phone || "",
    email: party.contact?.email || "",
  },
  socialMedia: {
    website: party.socialMedia?.website || "",
    facebook: party.socialMedia?.facebook || "",
    twitter: party.socialMedia?.twitter || "",
  },
});

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export default function PartyHome() {
  const [saved, setSaved] = useState({
    name: "",
    leader: "",
    vision: "",
    logoImage: "",
    team: [],
    establishedDate: "",
    headquarters: "",
    totalMembers: 0,
    electionWins: 0,
    gallery: [],
    contact: {
      address: "",
      phone: "",
      email: "",
    },
    socialMedia: {
      website: "",
      facebook: "",
      twitter: "",
    },
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
        const mappedRaw = mapProfileToState(party);
        const mapped = {
          ...mappedRaw,
          team: normalizeTeamForUi(mappedRaw.team || []),
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
        establishedDate: next.establishedDate || null,
        headquarters: next.headquarters,
        totalMembers: Number(next.totalMembers || 0),
        gallery: Array.isArray(next.gallery) ? next.gallery : [],
        contact: next.contact || {},
        socialMedia: next.socialMedia || {},
      });
      const profileRes = await api.get("/parties/profile/full");
      const mappedRaw = mapProfileToState(profileRes.data?.data || {});
      const synced = {
        ...mappedRaw,
        team: normalizeTeamForUi(mappedRaw.team || teamMembers),
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

  const updateContact = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      contact: {
        ...(prev.contact || {}),
        [field]: value,
      },
    }));
  };

  const updateSocial = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      socialMedia: {
        ...(prev.socialMedia || {}),
        [field]: value,
      },
    }));
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

  const handleGalleryAdd = async (files = []) => {
    const selectedFiles = Array.from(files || []).filter(Boolean);
    if (!selectedFiles.length) return;

    try {
      const images = await Promise.all(selectedFiles.map((file) => readAsDataUrl(file)));
      setDraft((prev) => ({
        ...prev,
        gallery: [...(Array.isArray(prev.gallery) ? prev.gallery : []), ...images],
      }));
    } catch {
      setSaveMessage("Failed to add selected images.");
    }
  };

  const removeGalleryImage = (index) => {
    setDraft((prev) => ({
      ...prev,
      gallery: (Array.isArray(prev.gallery) ? prev.gallery : []).filter((_, idx) => idx !== index),
    }));
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
                <div className="party-profile-meta-grid">
                  <label>
                    <span>Established</span>
                    <input
                      type="date"
                      value={draft.establishedDate || ""}
                      disabled={isLocked}
                      onChange={(event) => updateField("establishedDate", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Headquarters</span>
                    <input
                      value={draft.headquarters || ""}
                      disabled={isLocked}
                      onChange={(event) => updateField("headquarters", event.target.value)}
                      placeholder="Baneshwor, Kathmandu"
                    />
                  </label>
                  <label>
                    <span>Total Members</span>
                    <input
                      type="number"
                      min="0"
                      value={draft.totalMembers || 0}
                      disabled={isLocked}
                      onChange={(event) => updateField("totalMembers", Number(event.target.value || 0))}
                    />
                  </label>
                  <label>
                    <span>Election Wins</span>
                    <input
                      type="number"
                      min="0"
                      value={draft.electionWins || 0}
                      disabled
                      readOnly
                      title="Auto-calculated from ended elections"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <>
                <h2>{saved.name}</h2>
                <p>Leader: {saved.leader}</p>
                <div className="party-profile-stats">
                  <div>
                    <span>Established</span>
                    <strong>{saved.establishedDate ? new Date(saved.establishedDate).toLocaleDateString() : "-"}</strong>
                  </div>
                  <div>
                    <span>Headquarters</span>
                    <strong>{saved.headquarters || "-"}</strong>
                  </div>
                  <div>
                    <span>Total Members</span>
                    <strong>{Number(saved.totalMembers || 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Election Wins</span>
                    <strong>{Number(saved.electionWins || 0)}</strong>
                  </div>
                </div>
              </>
            )}
            <span className="party-profile-badge">
              <i className="ri-shield-check-line" aria-hidden="true" />
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

      <div className="party-gallery party-card">
        <div className="party-team-head">
          <h3>Photo Gallery</h3>
          {isEditing ? (
            <label className="party-btn outline party-gallery-upload">
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isLocked}
                onChange={(event) => handleGalleryAdd(event.target.files)}
              />
              <i className="ri-add-line" aria-hidden="true" />
              Add Photo
            </label>
          ) : null}
        </div>
        <div className="party-gallery-grid">
          {(isEditing ? draft.gallery : saved.gallery).length === 0 ? (
            <div className="party-gallery-empty">No gallery images uploaded.</div>
          ) : (
            (isEditing ? draft.gallery : saved.gallery).map((image, index) => (
              <div key={`gallery-${index}`} className="party-gallery-item">
                <img src={image} alt={`Gallery ${index + 1}`} />
                {isEditing ? (
                  <button
                    type="button"
                    className="party-btn danger"
                    onClick={() => removeGalleryImage(index)}
                    disabled={isLocked}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="party-contact party-card">
        <h3>Contact Information</h3>
        <div className="party-contact-grid">
          <label>
            <span>Address</span>
            {isEditing ? (
              <input
                value={draft.contact?.address || ""}
                onChange={(event) => updateContact("address", event.target.value)}
                disabled={isLocked}
                placeholder="Baneshwor, Kathmandu, Nepal"
              />
            ) : (
              <div className="party-contact-value">{saved.contact?.address || "-"}</div>
            )}
          </label>
          <label>
            <span>Phone</span>
            {isEditing ? (
              <input
                value={draft.contact?.phone || ""}
                onChange={(event) => updateContact("phone", event.target.value)}
                disabled={isLocked}
                placeholder="+977-1-4900000"
              />
            ) : (
              <div className="party-contact-value">{saved.contact?.phone || "-"}</div>
            )}
          </label>
          <label>
            <span>Email</span>
            {isEditing ? (
              <input
                value={draft.contact?.email || ""}
                onChange={(event) => updateContact("email", event.target.value)}
                disabled={isLocked}
                placeholder="info@party.gov.np"
              />
            ) : (
              <div className="party-contact-value">
                {saved.contact?.email ? (
                  <a href={`mailto:${saved.contact.email}`}>{saved.contact.email}</a>
                ) : (
                  "-"
                )}
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="party-social party-card">
        <h3>Social & Website</h3>
        <div className="party-contact-grid">
          <label>
            <span>Official Website</span>
            {isEditing ? (
              <input
                value={draft.socialMedia?.website || ""}
                onChange={(event) => updateSocial("website", event.target.value)}
                disabled={isLocked}
                placeholder="https://party.gov.np"
              />
            ) : (
              <div className="party-contact-value">
                {saved.socialMedia?.website ? (
                  <a href={saved.socialMedia.website} target="_blank" rel="noreferrer">
                    {saved.socialMedia.website}
                  </a>
                ) : (
                  "-"
                )}
              </div>
            )}
          </label>
          <label>
            <span>Facebook</span>
            {isEditing ? (
              <input
                value={draft.socialMedia?.facebook || ""}
                onChange={(event) => updateSocial("facebook", event.target.value)}
                disabled={isLocked}
                placeholder="https://facebook.com/party"
              />
            ) : (
              <div className="party-contact-value">
                {saved.socialMedia?.facebook ? (
                  <a href={saved.socialMedia.facebook} target="_blank" rel="noreferrer">
                    {saved.socialMedia.facebook}
                  </a>
                ) : (
                  "-"
                )}
              </div>
            )}
          </label>
          <label>
            <span>Twitter</span>
            {isEditing ? (
              <input
                value={draft.socialMedia?.twitter || ""}
                onChange={(event) => updateSocial("twitter", event.target.value)}
                disabled={isLocked}
                placeholder="https://x.com/party"
              />
            ) : (
              <div className="party-contact-value">
                {saved.socialMedia?.twitter ? (
                  <a href={saved.socialMedia.twitter} target="_blank" rel="noreferrer">
                    {saved.socialMedia.twitter}
                  </a>
                ) : (
                  "-"
                )}
              </div>
            )}
          </label>
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
