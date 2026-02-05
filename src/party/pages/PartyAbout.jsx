import { useState } from "react";
import { partyAbout } from "../data/fakePartyData";
import "../styles/about.css";

const clone = (value) => JSON.parse(JSON.stringify(value));

export default function PartyAbout() {
  const [savedPlans, setSavedPlans] = useState(() => clone(partyAbout.plans));
  const [draftPlans, setDraftPlans] = useState(() => clone(partyAbout.plans));
  const [isEditing, setIsEditing] = useState(false);

  const startEdit = () => {
    setDraftPlans(clone(savedPlans));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftPlans(clone(savedPlans));
    setIsEditing(false);
  };

  const saveEdit = () => {
    setSavedPlans(clone(draftPlans));
    setIsEditing(false);
  };

  const addPlan = () => {
    setDraftPlans((prev) => [...prev, ""]);
  };

  const updatePlan = (index, value) => {
    setDraftPlans((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const removePlan = (index) => {
    setDraftPlans((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>{partyAbout.title}</h1>
          <p>{partyAbout.subtitle}</p>
        </div>
        {isEditing ? (
          <div className="party-header-actions">
            <button type="button" className="party-btn ghost" onClick={cancelEdit}>
              Cancel
            </button>
            <button type="button" className="party-btn primary" onClick={saveEdit}>
              Save Changes
            </button>
          </div>
        ) : (
          <button className="party-edit-btn" type="button" onClick={startEdit}>
            Edit Plans
          </button>
        )}
      </div>

      <div className="about-card party-card">
        <div className="about-header">
          <div>
            <h3>Future Plans</h3>
            <span>
              {(isEditing ? draftPlans.length : savedPlans.length)} of 50 plans
              added
            </span>
          </div>
          {isEditing ? (
            <button type="button" className="party-btn outline" onClick={addPlan}>
              + Add Plan
            </button>
          ) : null}
        </div>
        <div className="about-list">
          {(isEditing ? draftPlans : savedPlans).map((plan, index) => (
            <div key={`${index}-${plan}`} className="about-item">
              <span>{index + 1}</span>
              {isEditing ? (
                <>
                  <input
                    value={plan}
                    placeholder="Enter future plan..."
                    onChange={(event) => updatePlan(index, event.target.value)}
                  />
                  <button
                    type="button"
                    className="about-remove"
                    onClick={() => removePlan(index)}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <p>{plan}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="about-guidelines">
        <div className="about-guidelines-title">
          <span>i</span>
          Guidelines
        </div>
        <ul>
          {partyAbout.guidelines.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
