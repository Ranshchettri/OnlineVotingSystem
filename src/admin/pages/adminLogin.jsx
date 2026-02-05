import "../styles/adminAuth.css";

const AdminLogin = () => {
  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <h2>Admin Access (UI Preview)</h2>
        <p className="admin-auth-subtitle">
          2FA is temporarily disabled so you can review the admin UI without
          logging in.
        </p>
        <button
          className="admin-auth-btn"
          onClick={() => (window.location.href = "/admin/dashboard")}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
