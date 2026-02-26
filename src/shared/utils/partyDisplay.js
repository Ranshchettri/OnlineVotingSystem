const isString = (value) => typeof value === "string";
const isObject = (value) => value !== null && typeof value === "object";
const normalizeParty = (party) => (isObject(party) ? party : {});

export const isLikelyImageSource = (value) => {
  if (!isString(value)) return false;
  const raw = value.trim();
  if (!raw) return false;
  return (
    /^data:image\//i.test(raw) ||
    /^https?:\/\//i.test(raw) ||
    /^blob:/i.test(raw)
  );
};

const isEncodedBlobText = (value) => {
  if (!isString(value)) return false;
  const raw = value.trim().toLowerCase();
  if (!raw) return false;
  return (
    raw.startsWith("data:") ||
    raw.includes("base64,") ||
    raw.length > 40
  );
};

const pickShortFromText = (value) => {
  if (!isString(value)) return "";
  const text = value.trim();
  if (!text) return "";
  if (isLikelyImageSource(text) || isEncodedBlobText(text)) return "";
  return text.slice(0, 12);
};

const buildInitials = (name, fallback = "P") => {
  if (!isString(name) || !name.trim()) return fallback;
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);
  if (!tokens.length) return fallback;
  const initials = tokens.map((token) => token[0]).join("");
  return initials.toUpperCase() || fallback;
};

export const getPartyLogoSrc = (party = {}) => {
  const safeParty = normalizeParty(party);
  const candidates = [
    safeParty.logo,
    safeParty.symbol,
    safeParty.image,
    safeParty.avatar,
  ];
  return candidates.find((item) => isLikelyImageSource(item)) || "";
};

export const getPartyShortLabel = (party = {}, fallback = "P") => {
  const safeParty = normalizeParty(party);
  const candidates = [
    safeParty.shortName,
    safeParty.short,
    safeParty.symbol,
    safeParty.code,
  ];
  for (const item of candidates) {
    const picked = pickShortFromText(item);
    if (picked) return picked;
  }
  return buildInitials(safeParty.name, fallback);
};
