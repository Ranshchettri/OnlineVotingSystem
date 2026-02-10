import { partyRules } from "../data/fakePartyData";
import "../styles/rules.css";

const IconDoc = () => <i className="ri-file-list-line" aria-hidden="true" />;
const IconBulb = () => <i className="ri-lightbulb-line" aria-hidden="true" />;
const IconWarn = () => <i className="ri-alert-line" aria-hidden="true" />;
const IconHelp = () => <i className="ri-customer-service-2-line" aria-hidden="true" />;
const IconCheck = () => <i className="ri-check-line" aria-hidden="true" />;
const IconClose = () => <i className="ri-close-line" aria-hidden="true" />;
const IconPhone = () => <i className="ri-phone-line" aria-hidden="true" />;
const IconMail = () => <i className="ri-mail-line" aria-hidden="true" />;

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
