export default function ProgressBar({ value }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const tone = safeValue >= 70 ? "green" : safeValue >= 50 ? "yellow" : "red";

  return (
    <div className="party-progress">
      <div className="progress">
        <div
          className={`progress-bar ${tone}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
