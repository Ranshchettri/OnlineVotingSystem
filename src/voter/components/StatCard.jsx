const icons = {
  green: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19h16" />
      <rect x="6" y="7" width="4" height="9" />
      <rect x="14" y="10" width="4" height="6" />
    </svg>
  ),
  yellow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4H7z" />
      <path d="M6 8h12l-1 5H7z" />
    </svg>
  ),
  orange: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <path d="M2 20c1.2-3 4-5 7-5" />
      <path d="M22 20c-1.2-3-4-5-7-5" />
    </svg>
  ),
  red: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 5-5 8-5s6.5 1.5 8 5" />
    </svg>
  ),
};

export default function StatCard({ label, value, tone, size }) {
  return (
    <div className={`card stat-card stat-card--${tone}`}>
      <div className="stat-card-icon">{icons[tone]}</div>
      <div>
        <p className="stat-card-label">{label}</p>
        <p className={`stat-card-value ${size === "sm" ? "sm" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
