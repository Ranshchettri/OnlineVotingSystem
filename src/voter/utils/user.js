export const getStoredVoter = () => {
  try {
    const raw = localStorage.getItem("voter");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};
