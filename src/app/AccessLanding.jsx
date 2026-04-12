import { useNavigate } from "react-router-dom";
import emblem from "../assets/nepal-emblem.svg";
import heroImage from "../assets/parliament-login-clear.jpg";
import "../styles/landing.css";

const featureCards = [
  {
    icon: "ri-shield-check-line",
    title: "Role-Based Security",
    description:
      "Admin, voter, and party journeys stay isolated with guarded routing and token-backed access.",
  },
  {
    icon: "ri-bar-chart-grouped-line",
    title: "Real-Time Analytics",
    description:
      "Live dashboards keep turnout, party progress, and election activity visible without delay.",
  },
  {
    icon: "ri-database-2-line",
    title: "Unified Data Layer",
    description:
      "Votes, profiles, elections, and reports stay connected in one auditable online voting platform.",
  },
];

const steps = [
  {
    number: "01",
    icon: "ri-user-add-line",
    title: "Register",
    description:
      "Create your voter account, verify identity details, and prepare your profile for secure participation.",
    tone: "mint",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
  },
  {
    number: "02",
    icon: "ri-shield-user-line",
    title: "Verify Identity",
    description:
      "Face verification and OTP checkpoints help confirm that every account belongs to a real voter.",
    tone: "cyan",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    number: "03",
    icon: "ri-checkbox-circle-line",
    title: "Cast Your Vote",
    description:
      "Browse approved parties, review manifestos, and submit your ballot with full confidence.",
    tone: "amber",
    image:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80",
  },
  {
    number: "04",
    icon: "ri-line-chart-line",
    title: "View Results",
    description:
      "Follow the count in real time through transparent dashboards built for citizens and administrators.",
    tone: "rose",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
  },
];

const portals = [
  {
    title: "Voter Portal",
    route: "/voter/login",
    icon: "ri-user-3-line",
    accent: "green",
    summary:
      "Register, verify identity, browse party profiles, and cast your vote securely from anywhere.",
    items: [
      "Face verification login",
      "Party profile viewer",
      "Live results dashboard",
      "Voting history",
    ],
    action: "Enter Voter Portal",
    image:
      "https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Party Portal",
    route: "/party/login",
    icon: "ri-flag-2-line",
    accent: "red",
    summary:
      "Manage your party profile, track real-time vote analytics, and monitor election performance.",
    items: [
      "Real-time vote tracking",
      "Analytics dashboard",
      "Profile management",
      "Notification center",
    ],
    action: "Enter Party Portal",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Admin Portal",
    route: "/admin/login",
    icon: "ri-shield-user-line",
    accent: "slate",
    summary:
      "Control elections, approve voter records, monitor parties, and review system-wide reporting.",
    items: [
      "Election management",
      "Voter management",
      "Export PDF and CSV reports",
      "Emergency controls",
    ],
    action: "Admin Access",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
];

const testimonials = [
  {
    quote:
      "Voting from home felt simple and trustworthy. The guided verification flow gave me confidence that my vote was secure.",
    name: "Ram Sharma",
    location: "Kathmandu",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    quote:
      "The live dashboard made the process feel transparent. We could follow election progress without waiting for delayed updates.",
    name: "Sita Thapa",
    location: "Pokhara",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
  {
    quote:
      "As a party representative, the analytics view helped us understand turnout patterns and monitor our campaign presence.",
    name: "Bikash Rai",
    location: "Biratnagar",
    avatar: "https://i.pravatar.cc/100?img=56",
  },
];

const newsletterImage =
  "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=1400&q=80";

export default function AccessLanding() {
  const navigate = useNavigate();

  const scrollToId = (id) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <div className="landing-brand">
          <img src={emblem} alt="Nepal emblem" />
          <div>
            <h1>Nepal Online Voting System</h1>
            <p>Election Commission of Nepal</p>
          </div>
        </div>
        <div className="landing-nav landing-nav-center">
          <button
            type="button"
            className="landing-nav-btn"
            onClick={() => scrollToId("landing-features")}
          >
            Features
          </button>
          <button
            type="button"
            className="landing-nav-btn"
            onClick={() => scrollToId("landing-about")}
          >
            About
          </button>
          <button
            type="button"
            className="landing-nav-btn"
            onClick={() => scrollToId("landing-portals")}
          >
            Portals
          </button>
        </div>
        <div className="landing-topbar-spacer" aria-hidden="true" />
      </header>

      <main
        className="landing-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="landing-overlay" />
        <div className="landing-content">
          <span className="landing-chip">National Digital Voting Platform | Nepal</span>
          <h2>Democracy in Action</h2>
          <p>
            Every citizen&apos;s voice matters. Cast your vote and shape the future of
            Nepal.
          </p>
          <div className="landing-actions">
            <button
              type="button"
              className="landing-primary"
              onClick={() => scrollToId("landing-portals")}
            >
              Get Started
            </button>
          </div>
        </div>
      </main>

      <section className="landing-section" id="landing-features">
        <div className="landing-section-head">
          <span className="landing-kicker">Core Capability</span>
          <h3>Core Features</h3>
          <p>Built for secure, transparent, and accountable digital elections.</p>
        </div>
        <div className="landing-feature-grid">
          {featureCards.map((card) => (
            <article key={card.title}>
              <i className={card.icon} aria-hidden="true" />
              <h4>{card.title}</h4>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-process-section">
        <div className="landing-section-head">
          <span className="landing-kicker">Simple Process</span>
          <h3>Vote in 4 Easy Steps</h3>
          <p>
            From registration to results, the full journey is designed to feel clear,
            professional, and fast.
          </p>
        </div>
        <div className="landing-steps-grid">
          {steps.map((step) => (
            <article key={step.number} className={`landing-step-card ${step.tone}`}>
              <span
                className="landing-step-media"
                style={{ "--step-image": `url(${step.image})` }}
                aria-hidden="true"
              />
              <div className="landing-step-content">
                <span className="landing-step-number">{step.number}</span>
                <span className="landing-step-icon" aria-hidden="true">
                  <i className={step.icon} />
                </span>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="landing-process-cta">
          <button
            type="button"
            className="landing-primary landing-process-button"
            onClick={() => scrollToId("landing-portals")}
          >
            <i className="ri-arrow-right-line" aria-hidden="true" />
            Start Voting Now
          </button>
        </div>
      </section>

      <section className="landing-section landing-section-alt" id="landing-about">
        <div className="landing-section-head">
          <span className="landing-kicker">Project Vision</span>
          <h3>About The Project</h3>
          <p>
            Nepal Online Voting System modernizes democratic participation with a
            secure multi-portal experience and auditable backend workflows.
          </p>
        </div>
        <div className="landing-about-points">
          <p>
            <strong>Transparent:</strong> Election lifecycle and outcomes are visible
            in role dashboards.
          </p>
          <p>
            <strong>Secure:</strong> OTP, session token control, and guarded route
            architecture.
          </p>
          <p>
            <strong>Scalable:</strong> Modular frontend and API backend designed for
            national expansion.
          </p>
        </div>
      </section>

      <section className="landing-section" id="landing-portals">
        <div className="landing-section-head">
          <span className="landing-kicker">Access Portals</span>
          <h3>Choose Your Portal</h3>
          <p>
            Select your role and continue into a focused workspace designed for that
            journey.
          </p>
        </div>
        <div className="landing-portal-grid">
          {portals.map((portal) => (
            <article key={portal.title} className={`landing-portal-card ${portal.accent}`}>
              <div
                className="landing-portal-visual"
                style={{ "--portal-image": `url(${portal.image})` }}
              >
                <div className="landing-portal-overlay" />
                <div className="landing-portal-heading">
                  <span className="landing-portal-icon" aria-hidden="true">
                    <i className={portal.icon} />
                  </span>
                  <h4>{portal.title}</h4>
                </div>
              </div>
              <div className="landing-portal-body">
                <p>{portal.summary}</p>
                <ul>
                  {portal.items.map((item) => (
                    <li key={item}>
                      <i className="ri-check-line" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => navigate(portal.route)}>
                  {portal.action}
                  <i className="ri-arrow-right-line" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-testimonial-section">
        <div className="landing-section-head">
          <span className="landing-kicker">Testimonials</span>
          <h3>Trusted by Citizens</h3>
          <p>
            A polished voting experience should feel reassuring for voters, parties,
            and election teams.
          </p>
        </div>
        <div className="landing-testimonial-grid">
          {testimonials.map((story) => (
            <article key={story.name} className="landing-testimonial-card">
              <div className="landing-stars" aria-hidden="true">
                <i className="ri-star-fill" />
                <i className="ri-star-fill" />
                <i className="ri-star-fill" />
                <i className="ri-star-fill" />
                <i className="ri-star-fill" />
              </div>
              <p className="landing-testimonial-quote">&quot;{story.quote}&quot;</p>
              <div className="landing-testimonial-user">
                <span className="landing-testimonial-avatar">
                  <img src={story.avatar} alt={story.name} />
                </span>
                <div>
                  <strong>{story.name}</strong>
                  <span>{story.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-newsletter">
        <div
          className="landing-newsletter-card"
          style={{ "--newsletter-image": `url(${newsletterImage})` }}
        >
          <div className="landing-newsletter-overlay" />
          <div className="landing-newsletter-content">
            <span className="landing-newsletter-icon" aria-hidden="true">
              <i className="ri-mail-send-line" />
            </span>
            <span className="landing-kicker">Stay Updated</span>
            <h3>Election announcements in one place</h3>
            <p>
              Get notified about portal updates, election schedules, and result
              releases with a cleaner, more modern landing experience.
            </p>
            <form
              className="landing-newsletter-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="shaha@gmail.com"
                aria-label="Email address"
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
