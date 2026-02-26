import "../styles/rules.css";

const votingRules = [
  "You must be a registered voter with a valid Voter ID to participate",
  "Each voter can cast only ONE vote per election",
  "Votes are final and cannot be changed once submitted",
  "You must verify your identity through OTP before voting",
  "Voting is only allowed during the official election period",
  "Your vote is completely confidential and anonymous",
];

const guideSteps = [
  {
    title: "Login to Voter Portal",
    description:
      "Use your registered email/mobile, Voter ID, and upload your photo for verification",
  },
  {
    title: "View Active Elections",
    description:
      "Browse all active political parties and their profiles on the dashboard",
  },
  {
    title: "Select Your Party",
    description:
      "Click on your preferred party to select them. Review their development score and policies",
  },
  {
    title: "Verify with OTP",
    description:
      "Enter the 6-digit OTP sent to your registered email address",
  },
  {
    title: "Submit Your Vote",
    description:
      "Confirm your selection. You will receive an email confirmation of your vote",
  },
];

const legalNotices = [
  {
    title: "Voter Eligibility",
    description:
      "All voters must be Nepali citizens aged 18 or above with valid government-issued identification.",
  },
  {
    title: "Vote Confidentiality",
    description:
      "Your vote is completely anonymous. The system does not store any information linking your identity to your vote choice.",
  },
  {
    title: "Electoral Fraud",
    description:
      "Any attempt to manipulate the voting system, vote multiple times, or impersonate another voter is a criminal offense punishable by law.",
  },
  {
    title: "Technical Support",
    description:
      "If you experience any technical issues during voting, contact the Election Commission helpline immediately.",
  },
];

export default function Rules() {
  return (
    <div>
      <div className="rules-header">
        <h1>Rules &amp; How-To Guide</h1>
        <p>Everything you need to know about voting</p>
      </div>

      <div className="rules-card">
        <div className="rules-card-title">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h8" />
            </svg>
          </span>
          <div>
            <h3>Voting Rules</h3>
            <p>Important guidelines for all voters</p>
          </div>
        </div>

        <div className="rules-list">
          {votingRules.map((rule, index) => (
            <div key={rule} className="rules-item">
              <span className="rules-number">{index + 1}</span>
              <p>{rule}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rules-card">
        <div className="rules-card-title guide-card-title">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h6l2 3 4-8h4" />
              <path d="M4 12v7h16v-7" />
            </svg>
          </span>
          <div>
            <h3>Step-by-Step Voting Guide</h3>
            <p>For first-time voters</p>
          </div>
        </div>

        <div className="guide-list">
          {guideSteps.map((step, index) => (
            <div key={step.title} className="guide-item">
              <div className="guide-step">{index + 1}</div>
              <div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rules-card">
        <div className="rules-card-title legal-card-title">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v18" />
              <path d="M6 7h12" />
              <path d="M6 17h12" />
            </svg>
          </span>
          <div>
            <h3>Legal Notices</h3>
            <p>Important legal information</p>
          </div>
        </div>

        <div className="legal-list">
          {legalNotices.map((notice) => (
            <div key={notice.title} className="legal-item">
              <h4>{notice.title}</h4>
              <p>{notice.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="help-card">
        <div className="help-title">
          <span className="help-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4a8 8 0 0 0-8 8v3a2 2 0 0 0 2 2h2" />
              <path d="M12 4a8 8 0 0 1 8 8v3a2 2 0 0 1-2 2h-2" />
              <path d="M12 18a2 2 0 0 0 2-2" />
            </svg>
          </span>
          <h4>Need Help?</h4>
        </div>
        <p>Contact the Election Commission for assistance</p>
        <ul>
          <li>Helpline: 01-4200000</li>
          <li>Email: support@ovs.gov.np</li>
        </ul>
      </div>
    </div>
  );
}
