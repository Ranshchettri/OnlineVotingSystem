import { useEffect, useState } from "react";
import api from "../../services/api";
import "../styles/about.css";

export default function PartyAbout() {
  const [party, setParty] = useState(null);
  const [focusAreas, setFocusAreas] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, plansRes] = await Promise.all([
          api.get("/party/profile/full"),
          api.get("/party/future-plans"),
        ]);
        const profile = profileRes.data?.data || {};
        setParty(profile);
        setFocusAreas(plansRes.data?.data?.futurePlans || []);
      } catch (err) {
        console.error("Failed to load party about data", err.message);
      }
    };
    load();
  }, []);

  return (
    <div className="party-page">
      <div className="party-page-header party-header-compact">
        <div>
          <h1>{party?.name || "Party"}</h1>
          <p>{party?.vision || party?.manifesto || "Vision not provided."}</p>
        </div>
        <button className="party-btn outline" type="button">
          <i className="ri-edit-line" aria-hidden="true" />
          Edit Plans
        </button>
      </div>

      <div className="about-section">
        <div className="about-plans-sidebar">
          <div className="plans-heading">
            <div>
              <h3>Future Plans</h3>
              <span className="plans-count">{focusAreas.length} items</span>
            </div>
          </div>
          <div className="about-list">
            {(focusAreas.length ? focusAreas : ["No future plans submitted."]).map(
              (item, index) => (
                <div key={`${index}-${item}`} className="about-item">
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ),
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
          <li>Keep party details updated before election lock-in.</li>
          <li>Ensure manifesto matches submitted documents.</li>
          <li>Uploads are stored directly in Mongo for transparency.</li>
        </ul>
      </div>
    </div>
  );
}
