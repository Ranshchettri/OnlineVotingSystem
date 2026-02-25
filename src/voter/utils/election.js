const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (value) => {
  const date = toDate(value);
  if (!date) return "N/A";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (value) => {
  const date = toDate(value);
  if (!date) return "N/A";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatDateTime = (value) => {
  const date = toDate(value);
  if (!date) return "N/A";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const normalizeElectionStatus = (election, now = new Date()) => {
  if (!election) return "unknown";
  const raw = String(election.status || "").toLowerCase();
  const start = toDate(election.startDate);
  const end = toDate(election.endDate);

  if (election.isEnded || raw === "ended") return "ended";
  if (raw === "running") return "running";
  if (raw === "upcoming") return "upcoming";

  if (start && now < start) return "upcoming";
  if (end && now > end) return "ended";
  if (election.isActive) return "running";

  return "upcoming";
};

export const getTimeLeft = (endDate) => {
  const end = toDate(endDate);
  if (!end) return "N/A";
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

export const pickCurrentElection = (elections = []) => {
  const running = elections.filter(
    (election) => normalizeElectionStatus(election) === "running",
  );
  if (running.length > 0) {
    return [...running].sort(
      (a, b) => new Date(a.endDate || 0) - new Date(b.endDate || 0),
    )[0];
  }

  const upcoming = elections.filter(
    (election) => normalizeElectionStatus(election) === "upcoming",
  );
  if (upcoming.length > 0) {
    return [...upcoming].sort(
      (a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0),
    )[0];
  }

  const ended = elections.filter(
    (election) => normalizeElectionStatus(election) === "ended",
  );
  if (ended.length > 0) {
    return [...ended].sort(
      (a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0),
    )[0];
  }

  return null;
};
