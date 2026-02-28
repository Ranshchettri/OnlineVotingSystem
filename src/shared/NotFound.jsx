import "./notFound.css";

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-card">
        <div className="notfound-badge">404</div>
        <h1>Page Not Found</h1>
        <p>
          The page you are looking for doesn't exist or has been moved. Please
          check the URL or go back to the dashboard.
        </p>
        <div className="notfound-actions">
          <a className="notfound-btn" href="/admin/dashboard">
            Go to Dashboard
          </a>
          <a className="notfound-btn secondary" href="/">
            Back to Home
          </a>
        </div>
      </div>
      <div className="notfound-orb orb-1" />
      <div className="notfound-orb orb-2" />
      <div className="notfound-orb orb-3" />
    </div>
  );
}

