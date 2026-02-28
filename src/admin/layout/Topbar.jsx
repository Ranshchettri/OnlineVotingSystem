import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import emblem from "../../assets/nepal-emblem.svg";
import api from "../../services/api";

const buildElectionNotifications = (items = []) => {
  return items
    .filter((election) => String(election.status || "").toLowerCase() === "ended")
    .sort((a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0))
    .slice(0, 5)
    .map((election) => {
      const parties = Array.isArray(election.parties)
        ? [...election.parties].sort(
            (a, b) => Number(b.votes || 0) - Number(a.votes || 0),
          )
        : [];
      const winner = parties[0] || null;
      const runner = parties[1] || null;
      const winnerVotes = Number(winner?.votes || 0);
      const runnerVotes = Number(runner?.votes || 0);
      const margin = Math.max(0, winnerVotes - runnerVotes);
      const title = election.title || "Election";

      return {
        id: election.id || election._id || `${title}-${election.endDate || ""}`,
        title: `${title} result published`,
        message: winner
          ? `${winner.name} won by ${margin.toLocaleString()} votes (${winnerVotes.toLocaleString()} total).`
          : "Election ended but winner data is not available yet.",
        time: election.endDate ? new Date(election.endDate).toLocaleString() : "Ended",
      };
    });
};

const Topbar = () => {
  const navigate = useNavigate();
  const userJson = localStorage.getItem("user");
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

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

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.get("/admin/elections");
        const list =
          response.data?.data?.elections ||
          response.data?.data ||
          response.data ||
          [];
        const electionList = Array.isArray(list) ? list : [];
        setNotifications(buildElectionNotifications(electionList));
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__left">
        <img className="admin-topbar__logo" src={emblem} alt="Nepal emblem" />
        <div className="admin-topbar__titles">
          <div className="admin-topbar__title">Admin Control Tower</div>
          <div className="admin-topbar__subtitle">
              Full System Control
          </div>
        </div>
      </div>

      <div className="admin-topbar__right">
        <div className="admin-topbar__menu-wrap" ref={notificationRef}>
          <button
            className="admin-topbar__icon-btn"
            aria-label="Notifications"
            onClick={() => setNotifOpen((prev) => !prev)}
          >
            {notifications.length > 0 ? <span className="admin-topbar__badge" /> : null}
            <i className="ri-notification-3-line" aria-hidden="true" />
          </button>
          {notifOpen && (
            <div className="admin-topbar__dropdown admin-topbar__dropdown--notifications">
              <div className="admin-topbar__dropdown-title">Notifications</div>
              {notifications.length === 0 ? (
                <div className="admin-topbar__dropdown-empty">No new result notifications</div>
              ) : (
                notifications.map((item) => (
                  <div key={item.id} className="admin-topbar__notif-item">
                    <div className="admin-topbar__notif-head">{item.title}</div>
                    <div className="admin-topbar__notif-body">{item.message}</div>
                    <div className="admin-topbar__notif-time">{item.time}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="admin-topbar__menu-wrap" ref={profileRef}>
          <button
            className="admin-topbar__profile admin-topbar__profile-btn"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
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
          </button>
          {profileOpen && (
            <div className="admin-topbar__dropdown admin-topbar__dropdown--profile">
              <button className="admin-topbar__logout" onClick={handleLogout}>
                <i className="ri-logout-box-r-line" aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
