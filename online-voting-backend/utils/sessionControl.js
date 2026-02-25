let forceLogoutAfterIat = 0;

const markForceLogout = () => {
  forceLogoutAfterIat = Math.floor(Date.now() / 1000);
  return forceLogoutAfterIat;
};

const shouldInvalidateToken = (decodedToken = {}) => {
  const tokenIssuedAt = Number(decodedToken.iat || 0);
  if (!tokenIssuedAt || !forceLogoutAfterIat) return false;
  return tokenIssuedAt < forceLogoutAfterIat;
};

const getForceLogoutAfter = () => forceLogoutAfterIat;

module.exports = {
  markForceLogout,
  shouldInvalidateToken,
  getForceLogoutAfter,
};
