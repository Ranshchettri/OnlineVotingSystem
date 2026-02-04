import { partyAbout } from "../data/fakePartyData";
import "../styles/about.css";

export default function PartyAbout() {
  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>{partyAbout.title}</h1>
          <p>{partyAbout.subtitle}</p>
        </div>
        <button className="party-edit-btn" type="button">
          Edit Plans
        </button>
      </div>

      <div className="about-card party-card">
        <div className="about-header">
          <h3>Future Plans</h3>
          <span>10 of 50 plans added</span>
        </div>
        <div className="about-list">
          {partyAbout.plans.map((plan, index) => (
            <div key={plan} className="about-item">
              <span>{index + 1}</span>
              {plan}
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
