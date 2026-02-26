import "../styles/rules.css";

const partyRulesContent = {
  title: "Party Rules & Guidelines",
  subtitle: "Important rules for political parties",
  rules: [
    "Only government-issued email addresses are allowed for party accounts.",
    "Party profiles must be activated by the Election Commission Admin.",
    "Profile editing is locked 24 hours before election start time.",
    "Development percentages and analytics are controlled by Admin only.",
    "Parties cannot edit or manipulate performance metrics.",
    "Maximum 50 future plans can be added in About section.",
    "All party information must be accurate and verifiable.",
    "Parties with development score below 40% may be auto-blocked.",
    "Vote counts are updated in real-time and are read-only.",
    "Results are automatically calculated when election ends.",
  ],
  bestPractices: {
    title: "Best Practices",
    subtitle: "Guidelines for success",
    sections: [
      {
        title: "Profile Management",
        items: [
          "Keep party logo and team photos updated.",
          "Write clear and realistic future plans.",
          "Update vision and motivation regularly.",
          "Ensure all team member information is accurate.",
        ],
      },
      {
        title: "During Elections",
        items: [
          "Monitor vote count in real-time.",
          "Check competitor standings for strategy.",
          "Respond to voter concerns promptly.",
          "Maintain transparency in all communications.",
        ],
      },
      {
        title: "Performance Metrics",
        items: [
          "Development scores are based on policy implementation.",
          "Good work and bad work are evaluated by feedback.",
          "Historical performance affects voter trust.",
          "Focus on consistent positive impact.",
        ],
      },
    ],
  },
  restrictions: [
    "Editing development percentages or analytics",
    "Manipulating vote counts or election data",
    "Editing profile after deadline",
    "Sharing false or misleading information",
  ],
  help: {
    phone: "01-4200000",
    email: "party-support@ovs.gov.np",
  },
};

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
    <div className="party-page party-rules-page">
      <div className="party-page-header">
        <div>
          <h1>{partyRulesContent.title}</h1>
          <p>{partyRulesContent.subtitle}</p>
        </div>
      </div>

      <div className="party-card rules-card">
        <h3 className="rules-title">
          <span className="rules-title-icon"><IconDoc /></span>
          Party Rules
        </h3>
        <p className="rules-subtitle">Mandatory rules for all parties</p>
        <div className="rules-list">
          {partyRulesContent.rules.map((rule, index) => (
            <div key={rule} className="rules-item">
              <span className="rules-index">{index + 1}</span>
              {rule}
            </div>
          ))}
        </div>
      </div>

      <div className="party-card rules-best">
        <h3 className="rules-title rules-title--blue">
          <span className="rules-title-icon"><IconBulb /></span>
          {partyRulesContent.bestPractices.title}
        </h3>
        <p className="rules-subtitle">{partyRulesContent.bestPractices.subtitle}</p>
        <div className="rules-best-list">
          {partyRulesContent.bestPractices.sections.map((section) => (
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
        <h3 className="rules-title rules-title--orange">
          <span className="rules-title-icon"><IconWarn /></span>
          Important Restrictions
        </h3>
        <p className="rules-subtitle rules-subtitle--orange">
          The following actions are strictly prohibited:
        </p>
        <ul>
          {partyRulesContent.restrictions.map((item) => (
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
        <h3 className="rules-title rules-title--blue">
          <span className="rules-title-icon"><IconHelp /></span>
          Need Help?
        </h3>
        <p className="rules-subtitle">Contact the Election Commission for assistance</p>
        <div className="rules-help-list">
          <span>
            <IconPhone /> Helpline: {partyRulesContent.help.phone}
          </span>
          <span>
            <IconMail /> Email: {partyRulesContent.help.email}
          </span>
        </div>
      </div>
    </div>
  );
}
