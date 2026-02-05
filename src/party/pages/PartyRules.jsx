import { partyRules } from "../data/fakePartyData";
import "../styles/rules.css";

const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M8 8h8" />
    <path d="M8 12h8" />
    <path d="M8 16h6" />
  </svg>
);

const IconBulb = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 1 4 12c-1 1-1 2-1 3H9c0-1 0-2-1-3a7 7 0 0 1 4-12z" />
  </svg>
);

const IconWarn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 9v4" />
    <circle cx="12" cy="17" r="1" />
    <path d="M10 3h4l7 14H3z" />
  </svg>
);

const IconHelp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12a8 8 0 0 1 16 0" />
    <path d="M18 12v5a2 2 0 0 1-2 2h-1" />
    <path d="M6 12v5a2 2 0 0 0 2 2h1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="18" r="1" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6l-8 8-4-4" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 6l12 12" />
    <path d="M18 6l-12 12" />
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.47-1.13a2 2 0 0 1 2.11-.45c.83.29 1.7.5 2.6.62a2 2 0 0 1 1.72 1.98z" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6h16v12H4z" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

export default function PartyRules() {
  return (
    <div className="party-page">
      <div className="party-page-header">
        <div>
          <h1>{partyRules.title}</h1>
          <p>{partyRules.subtitle}</p>
        </div>
      </div>

      <div className="party-card rules-card">
        <div className="rules-card-head">
          <div className="rules-card-icon">
            <IconDoc />
          </div>
          <div>
            <h3>Party Rules</h3>
            <p>Mandatory rules for all parties</p>
          </div>
        </div>
        <div className="rules-list">
          {partyRules.rules.map((rule, index) => (
            <div key={rule} className="rules-item">
              <span className="rules-index">{index + 1}</span>
              {rule}
            </div>
          ))}
        </div>
      </div>

      <div className="party-card rules-best">
        <div className="rules-best-head">
          <div className="rules-best-icon">
            <IconBulb />
          </div>
          <div>
            <h3>{partyRules.bestPractices.title}</h3>
            <p>{partyRules.bestPractices.subtitle}</p>
          </div>
        </div>
        <div className="rules-best-list">
          {partyRules.bestPractices.sections.map((section) => (
            <div key={section.title} className="rules-best-section">
              <h4>{section.title}</h4>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>
                    <span>
                      <IconCheck />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="party-card rules-restrict">
        <div className="rules-restrict-head">
          <div className="rules-restrict-icon">
            <IconWarn />
          </div>
          <div>
            <h3>Important Restrictions</h3>
            <p>The following actions are strictly prohibited:</p>
          </div>
        </div>
        <ul>
          {partyRules.restrictions.map((item) => (
            <li key={item}>
              <span>
                <IconClose />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="party-card rules-help">
        <div className="rules-help-head">
          <div className="rules-help-icon">
            <IconHelp />
          </div>
          <div>
            <h3>Need Help?</h3>
            <p>Contact the Election Commission for assistance</p>
          </div>
        </div>
        <div className="rules-help-list">
          <span>
            <IconPhone /> Helpline: {partyRules.help.phone}
          </span>
          <span>
            <IconMail /> Email: {partyRules.help.email}
          </span>
        </div>
      </div>
    </div>
  );
}
