import { useMemo } from "react";
import emblem from "../../assets/nepal-emblem.svg";

const Topbar = () => {
  const userJson = localStorage.getItem("user");
  const user = useMemo(() => {
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, [userJson]);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : user?.email
      ? user.email[0].toUpperCase()
      : "A";

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__left">
        <img className="admin-topbar__logo" src={emblem} alt="Nepal emblem" />
        <div className="admin-topbar__titles">
          <div className="admin-topbar__title">Admin Control Tower</div>
          <div className="admin-topbar__subtitle">
            Master Brain - Full System Control
          </div>
        </div>
      </div>

      <div className="admin-topbar__right">
        <button className="admin-topbar__icon-btn" aria-label="Notifications">
          <span className="admin-topbar__badge" />
          <i className="ri-notification-3-line" aria-hidden="true" />
        </button>

        <div className="admin-topbar__profile">
          <div className="admin-topbar__avatar">{initials}</div>
          <div className="admin-topbar__profile-text">
            <div className="admin-topbar__profile-name">
              {user?.fullName || "Admin"}
            </div>
            <div className="admin-topbar__profile-role">Super Admin</div>
          </div>
          <span className="admin-topbar__chev">
            <i className="ri-arrow-down-s-line" aria-hidden="true" />
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
