const Party = require("../models/Party");
const User = require("../models/User");
const Vote = require("../models/Vote");
const Notification = require("../models/Notification");

const toId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return toId(value._id);
  if (typeof value.toString === "function") return value.toString();
  return "";
};

const uniqueIds = (items = []) => [...new Set(items.map(toId).filter(Boolean))];

const getElectionPartyIds = async (
  election,
  {
    includeElectionLinked = true,
    includeVotes = false,
    includeActiveFallback = false,
  } = {},
) => {
  if (!election?._id) return [];

  const fromElection = Array.isArray(election.participatingParties)
    ? election.participatingParties.map((row) => row?.partyId)
    : [];

  const collected = [...fromElection];

  if (includeElectionLinked) {
    const linkedParties = await Party.find({ electionId: election._id }).select("_id").lean();
    collected.push(...linkedParties.map((item) => item._id));
  }

  if (includeVotes) {
    const votedPartyIds = await Vote.distinct("partyId", {
      electionId: election._id,
      partyId: { $ne: null },
    });
    collected.push(...votedPartyIds);
  }

  const normalized = uniqueIds(collected);
  if (normalized.length > 0) return normalized;

  if (!includeActiveFallback) return [];
  const activeParties = await Party.find({ status: "approved", isActive: true })
    .select("_id")
    .lean();
  return uniqueIds(activeParties.map((item) => item._id));
};

const notifyPartyIds = async (partyIds = [], payload = {}) => {
  try {
    const ids = uniqueIds(partyIds);
    if (!ids.length || !payload?.title || !payload?.message) return 0;

    const users = await User.find({ role: "party", partyId: { $in: ids } })
      .select("_id")
      .lean();
    if (!users.length) return 0;

    const documents = users.map((user) => ({
      userId: user._id,
      type: payload.type || "info",
      title: payload.title,
      message: payload.message,
    }));
    await Notification.insertMany(documents);
    return documents.length;
  } catch (error) {
    console.error("Failed to create party notifications:", error.message);
    return 0;
  }
};

const notifyElectionToParties = async (election, payload = {}, options = {}) => {
  try {
    const partyIds = await getElectionPartyIds(election, options);
    return notifyPartyIds(partyIds, payload);
  } catch (error) {
    console.error("Failed to notify election parties:", error.message);
    return 0;
  }
};

module.exports = {
  getElectionPartyIds,
  notifyPartyIds,
  notifyElectionToParties,
};
