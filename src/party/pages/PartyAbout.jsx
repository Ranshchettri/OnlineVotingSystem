import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/about.css";

const MAX_FUTURE_PLANS = 50;

export default function PartyAbout() {
  const [party, setParty] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [draftPlans, setDraftPlans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(
    async ({ preserveDraft = false } = {}) => {
      try {
        const [profileRes, plansRes] = await Promise.all([
          api.get("/parties/profile/full"),
          api.get("/parties/future-plans"),
        ]);

        const profile = profileRes.data?.data || {};
        const plansPayload = plansRes.data?.data || {};
        const fetchedPlans = Array.isArray(plansPayload.futurePlans)
          ? plansPayload.futurePlans
          : [];

        setParty(profile);
        setSavedPlans(fetchedPlans);
        setIsLocked(Boolean(plansPayload.isEditingLocked));

        if (!preserveDraft) {
          setDraftPlans(fetchedPlans);
        }
      } catch (err) {
        console.error("Failed to load party about data", err.message);
        setMessage("Unable to load latest future plans.");
      }
    },
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isEditing) {
        load({ preserveDraft: false });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isEditing, load]);

  const startEdit = () => {
    setMessage("");
    setDraftPlans(savedPlans.length ? [...savedPlans] : [""]);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftPlans(savedPlans);
    setIsEditing(false);
    setMessage("");
  };

  const addPlan = () => {
    if (draftPlans.length >= MAX_FUTURE_PLANS) return;
    setDraftPlans((prev) => [...prev, ""]);
  };

  const removePlan = (index) => {
    setDraftPlans((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updatePlan = (index, value) => {
    setDraftPlans((prev) =>
      prev.map((item, idx) => (idx === index ? value : item)),
    );
  };

  const savePlans = async () => {
    const cleaned = draftPlans
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, MAX_FUTURE_PLANS);

    try {
      setSaving(true);
      await api.put("/parties/future-plans", {
        futurePlans: cleaned,
      });
      setSavedPlans(cleaned);
      setDraftPlans(cleaned);
      setIsEditing(false);
      setMessage("Future plans updated successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update future plans.");
    } finally {
      setSaving(false);
    }
  };

  const plansToShow = isEditing ? draftPlans : savedPlans;

  return (
    <div className="party-page">
      <div className="party-page-header party-header-compact">
        <div>
          <h1>About &amp; Future Plans</h1>
          <p>Share your party&apos;s vision and goals</p>
        </div>

        {!isEditing ? (
          <button
            className="party-edit-btn"
            type="button"
            onClick={startEdit}
            disabled={isLocked}
            title={isLocked ? "Editing is locked before election start" : "Edit future plans"}
          >
            <i className="ri-edit-line" aria-hidden="true" />
            {isLocked ? "Editing Locked" : "Edit Plans"}
          </button>
        ) : (
          <div className="party-header-actions">
            <button className="party-btn ghost" type="button" onClick={cancelEdit}>
              Cancel
            </button>
            <button
              className="party-btn primary"
              type="button"
              onClick={savePlans}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Plans"}
            </button>
          </div>
        )}
      </div>

      {party?.vision ? (
        <div className="about-description">
          <h2>Party Vision</h2>
          <p>{party.vision}</p>
        </div>
      ) : null}

      <div className="about-section">
        <div className="about-plans-sidebar">
          <div className="plans-heading">
            <div>
              <h3>Future Plans</h3>
              <span className="plans-count">
                {plansToShow.filter((item) => String(item || "").trim()).length} of {MAX_FUTURE_PLANS} plans
                {" "}
                added
              </span>
            </div>
            {isEditing ? (
              <button
                className="party-btn outline add-plan-btn"
                type="button"
                onClick={addPlan}
                disabled={plansToShow.length >= MAX_FUTURE_PLANS}
              >
                <i className="ri-add-line" aria-hidden="true" />
                Add Plan
              </button>
            ) : null}
          </div>

          <div className="about-list">
            {plansToShow.length === 0 && !isEditing ? (
              <div className="about-item">
                <span>1</span>
                <p>No future plans submitted.</p>
              </div>
            ) : (
              plansToShow.map((item, index) => (
                <div key={`plan-${index}`} className="about-item">
                  <span>{index + 1}</span>
                  {isEditing ? (
                    <>
                      <input
                        value={item}
                        onChange={(event) => updatePlan(index, event.target.value)}
                        placeholder="Write future plan..."
                        maxLength={250}
                      />
                      <button
                        type="button"
                        className="about-remove"
                        onClick={() => removePlan(index)}
                        aria-label={`Remove plan ${index + 1}`}
                      >
                        <i className="ri-delete-bin-line" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <p>{item}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="about-guidelines">
        <div className="about-guidelines-title">
          <span>
            <i className="ri-information-line" aria-hidden="true" />
          </span>
          <b>Guidelines</b>
        </div>
        <ul>
          <li>Maximum 50 future plans allowed.</li>
          <li>Be specific and realistic with your plans.</li>
          <li>Plans are visible to all voters from your profile.</li>
          <li>Editing locks 24 hours before election start.</li>
        </ul>
      </div>

      {message ? <div className="about-message">{message}</div> : null}
    </div>
  );
}
