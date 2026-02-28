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

const buildStandingsForElection = async (election) => {
  const partyIds = await getElectionPartyIds(election, {
    includeElectionLinked: true,
    includeVotes: true,
    includeActiveFallback: true,
  });

  if (!partyIds.length) return [];

  const voteRows = await Vote.aggregate([
    { $match: { electionId: election._id, partyId: { $ne: null } } },
    { $group: { _id: "$partyId", votes: { $sum: 1 } } },
  ]);

  const votesByParty = new Map();
  voteRows.forEach((row) => {
    if (!row?._id) return;
    votesByParty.set(toId(row._id), Number(row.votes || 0));
  });

  const parties = await Party.find({ _id: { $in: partyIds } })
    .select("_id name")
    .lean();
  const partyById = new Map(parties.map((party) => [toId(party._id), party]));

  return partyIds
    .map((partyId) => ({
      partyId,
      name: partyById.get(partyId)?.name || "Party",
      votes: Number(votesByParty.get(partyId) || 0),
    }))
    .sort((a, b) => {
      if (b.votes === a.votes) return a.name.localeCompare(b.name);
      return b.votes - a.votes;
    });
};

const notifyElectionOutcomeToParties = async (election) => {
  try {
    if (!election?._id) return 0;

    const standings = await buildStandingsForElection(election);
    if (!standings.length) return 0;

    const winner = standings[0];
    const notifications = standings.map((entry, index) => {
      const isWinner = index === 0;
      return {
        partyId: entry.partyId,
        payload: {
          type: isWinner ? "success" : "warning",
          title: isWinner ? "Election result: You won" : "Election result: You lost",
          message: isWinner
            ? `Your party won ${election.title}. Final votes: ${entry.votes.toLocaleString()}.`
            : `${winner.name} won ${election.title}. Your party received ${entry.votes.toLocaleString()} votes.`,
        },
      };
    });

    const total = await Promise.all(
      notifications.map((item) => notifyPartyIds([item.partyId], item.payload)),
    );
    return total.reduce((sum, value) => sum + Number(value || 0), 0);
  } catch (error) {
    console.error("Failed to notify election outcome:", error.message);
    return 0;
  }
};

const ensureElectionAnalyticsSnapshot = async (election) => {
  try {
    if (!election?._id) return;
    const partyIds = await getElectionPartyIds(election, {
      includeElectionLinked: true,
      includeVotes: true,
      includeActiveFallback: true,
    });
    if (!partyIds.length) return;

    const parties = await Party.find({ _id: { $in: partyIds } });
    const year = new Date(election.startDate || Date.now()).getFullYear();
    const label = election.title || `Election ${year}`;

    await Promise.all(
      parties.map(async (party) => {
        if (!Array.isArray(party.historicalData)) {
          party.historicalData = [];
        }

        const existing = party.historicalData.find(
          (entry) => toId(entry.electionId) === toId(election._id),
        );
        if (existing) return;

        party.historicalData.push({
          electionId: election._id,
          year,
          label,
          development: Number(party.development || 0),
          goodWork: Number(party.goodWork || 0),
          badWork: Number(party.badWork || 0),
          votes: 0,
          won: false,
          totalParties: partyIds.length,
        });
        await party.save();
      }),
    );
  } catch (error) {
    console.error("Failed to create analytics snapshot:", error.message);
  }
};

const finalizeElectionAnalyticsSnapshot = async (election) => {
  try {
    if (!election?._id) return;
    const standings = await buildStandingsForElection(election);
    if (!standings.length) return;

    const parties = await Party.find({ _id: { $in: standings.map((item) => item.partyId) } });
    const byId = new Map(standings.map((item) => [item.partyId, item]));
    const winnerId = standings[0]?.partyId || "";
    const year = new Date(election.endDate || Date.now()).getFullYear();
    const label = election.title || `Election ${year}`;

    await Promise.all(
      parties.map(async (party) => {
        if (!Array.isArray(party.historicalData)) {
          party.historicalData = [];
        }

        const standing = byId.get(toId(party._id));
        const votes = Number(standing?.votes || 0);
        const won = toId(party._id) === winnerId && votes > 0;
        const existingIndex = party.historicalData.findIndex(
          (entry) => toId(entry.electionId) === toId(election._id),
        );

        const row = {
          electionId: election._id,
          year,
          label,
          development: Number(party.development || 0),
          goodWork: Number(party.goodWork || 0),
          badWork: Number(party.badWork || 0),
          votes,
          won,
          totalParties: standings.length,
        };

        if (existingIndex >= 0) {
          party.historicalData[existingIndex] = {
            ...party.historicalData[existingIndex],
            ...row,
          };
        } else {
          party.historicalData.push(row);
        }

        await party.save();
      }),
    );
  } catch (error) {
    console.error("Failed to finalize analytics snapshot:", error.message);
  }
};

module.exports = {
  getElectionPartyIds,
  notifyPartyIds,
  notifyElectionToParties,
  notifyElectionOutcomeToParties,
  ensureElectionAnalyticsSnapshot,
  finalizeElectionAnalyticsSnapshot,
};
