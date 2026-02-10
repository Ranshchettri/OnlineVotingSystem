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
    setDraftPlans((prev) =>
      prev.map((item, idx) => (idx === index ? value : item)),
    );
  };

  const removePlan = (index) => {
    setDraftPlans((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="party-page">
      <div className="party-page-header party-header-compact">
        <div>
          <h1>{partyAbout.title}</h1>
          <p>{partyAbout.subtitle}</p>
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
            Edit Plans
          </button>
        )}
      </div>

      <div className="about-section">
        <div className="about-plans-sidebar">
          <div className="plans-heading">
            <h3>Future Plans</h3>
            <span className="plans-count">
              {isEditing ? draftPlans.length : savedPlans.length} of 50 plans
              added
            </span>
          </div>
          {isEditing ? (
            <button
              type="button"
              className="party-btn outline add-plan-btn"
              onClick={addPlan}
            >
              <i className="ri-add-line" aria-hidden="true" />
              Add Plan
            </button>
          ) : null}
          <div className="about-list">
            {(isEditing ? draftPlans : savedPlans).map((plan, index) => (
              <div key={`${index}-${plan}`} className="about-item">
                <span>{index + 1}</span>
                {isEditing ? (
                  <>
                    <input
                      value={plan}
                      placeholder="Enter future plan..."
                      onChange={(event) =>
                        updatePlan(index, event.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="about-remove"
                      onClick={() => removePlan(index)}
                    >
                      <i className="ri-delete-bin-line" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <p>{plan}</p>
                )}
              </div>
            ))}
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
          {partyAbout.guidelines.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
