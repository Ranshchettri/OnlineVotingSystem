const mongoose = require("mongoose");
const Party = require("../models/Party");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

const normalizeEmail = (email = "") => String(email || "").trim().toLowerCase();
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveParty = async (req) => {
  let partyId = req.params.partyId || null;

  if (!partyId && req.user?.role === "party" && req.user?.email) {
    const emailRegex = new RegExp(`^${escapeRegex(normalizeEmail(req.user.email))}$`, "i");
    const partyByEmail = await Party.findOne({ email: emailRegex }).sort({ createdAt: -1 });
    if (partyByEmail?._id) {
      partyId = partyByEmail._id;
    }
  }

  if (!partyId) {
    partyId = req.user?.partyId || null;
  }

  if (!partyId) throw new AppError("Party ID not found", 400);

  const party = await Party.findById(partyId);
  if (!party) throw new AppError("Party not found", 404);
  return party;
};

const isEditingLocked = (election) => {
  if (!election) return false;
  if (!election.startDate) return false;
  const diffMs = new Date(election.startDate).getTime() - Date.now();
  return diffMs <= 24 * 60 * 60 * 1000; // 24 hours
};

const deriveElectionStatus = (election = {}, now = new Date()) => {
  const start = election.startDate ? new Date(election.startDate) : null;
  const end = election.endDate ? new Date(election.endDate) : null;
  const raw = String(election.status || "").toLowerCase();

  if (raw === "ended" || election.isEnded || election.allowVoting === false) return "Ended";
  if (end && now > end) return "Ended";
  if (start && now < start) return "Upcoming";
  if (start && end && now >= start && now <= end && election.allowVoting !== false) {
    return "Running";
  }
  if (raw === "running" || raw === "upcoming") return raw[0].toUpperCase() + raw.slice(1);
  return "Upcoming";
};

const findRelevantElectionForParty = async (party, now = new Date()) => {
  const partyTypeRegex = party?.electionType
    ? new RegExp(`^${escapeRegex(String(party.electionType))}$`, "i")
    : null;

  const runningFilter = {
    startDate: { $lte: now },
    endDate: { $gte: now },
    allowVoting: { $ne: false },
    isEnded: { $ne: true },
  };
  if (partyTypeRegex) {
    runningFilter.type = partyTypeRegex;
  }
  const runningElection = await Election.findOne(runningFilter).sort({ startDate: -1 });
  if (runningElection) return runningElection;

  if (party?.electionId) {
    const linkedElection = await Election.findById(party.electionId);
    if (linkedElection && deriveElectionStatus(linkedElection, now) !== "Ended") {
      return linkedElection;
    }
  }

  const upcomingFilter = {
    startDate: { $gt: now },
    isEnded: { $ne: true },
  };
  if (partyTypeRegex) {
    upcomingFilter.type = partyTypeRegex;
  }
  const upcomingElection = await Election.findOne(upcomingFilter).sort({ startDate: 1 });
  if (upcomingElection) return upcomingElection;

  const fallbackUpcoming = await Election.findOne({
    startDate: { $gt: now },
    isEnded: { $ne: true },
  }).sort({ startDate: 1 });

  if (fallbackUpcoming) return fallbackUpcoming;

  return upcomingElection || null;
};

const sanitizeTeamMembers = (teamMembers = []) => {
  if (!Array.isArray(teamMembers)) return [];
  return teamMembers
    .map((member = {}) => ({
      name: String(member.name || "").trim(),
      role: String(member.role || member.position || "").trim(),
      position: String(member.position || member.role || "").trim(),
      photo: member.photo || "",
      bio: String(member.bio || "").trim(),
    }))
    .filter((member) => Boolean(member.name));
};

const sanitizeGallery = (gallery = []) => {
  if (!Array.isArray(gallery)) return [];
  return gallery
    .map((item) => String(item || "").trim())
    .filter((item) => Boolean(item));
};

const clampPercent = (value) => {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const sanitizeBreakdown = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      label: String(item?.label || "").trim(),
      value: clampPercent(item?.value),
    }))
    .filter((item) => Boolean(item.label));
};

const defaultGoodBreakdown = (party) => [
  { label: "Infrastructure", value: clampPercent(party?.detailedMetrics?.infrastructure) },
  { label: "Healthcare", value: clampPercent(party?.detailedMetrics?.healthcare) },
  { label: "Education", value: clampPercent(party?.detailedMetrics?.education) },
];

const defaultBadBreakdown = (party) => [
  { label: "Policy failures", value: clampPercent(party?.detailedMetrics?.policyFailures) },
  { label: "Corruption cases", value: clampPercent(party?.detailedMetrics?.corruptionCases) },
  { label: "Public complaints", value: clampPercent(party?.detailedMetrics?.publicComplaints) },
];

const buildEndedElectionFilter = () => ({
  $or: [
    { status: /^ended$/i },
    { isEnded: true },
    { allowVoting: false },
    { endDate: { $lte: new Date() } },
  ],
});

const buildElectionPartyRanking = async (election, party) => {
  if (!election?._id) {
    return {
      totalVotes: 0,
      ownVotes: 0,
      ownPosition: 0,
      totalParties: 0,
      ranking: [],
    };
  }

  const voteAgg = await Vote.aggregate([
    {
      $match: {
        electionId: new mongoose.Types.ObjectId(election._id),
        partyId: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$partyId",
        votes: { $sum: 1 },
      },
    },
    { $sort: { votes: -1 } },
  ]);

  const votesByPartyId = new Map(
    voteAgg.map((row) => [row._id?.toString(), Number(row.votes || 0)]),
  );

  const participatingIds = Array.isArray(election.participatingParties)
    ? election.participatingParties
        .map((row) => row?.partyId?.toString?.() || row?.partyId || null)
        .filter(Boolean)
    : [];

  const requestedPartyIds = [
    ...new Set([...participatingIds, party?._id?.toString?.()].filter(Boolean)),
  ];
  const votedPartyIds = [...votesByPartyId.keys()];
  const electionTypeRegex = election?.type
    ? new RegExp(`^${escapeRegex(String(election.type))}$`, "i")
    : null;

  const partiesById = new Map();
  const mergeParties = (items = []) => {
    items.forEach((item) => {
      const id = item?._id?.toString?.();
      if (id) partiesById.set(id, item);
    });
  };

  if (requestedPartyIds.length) {
    mergeParties(await Party.find({ _id: { $in: requestedPartyIds } }).lean());
  }

  if (votedPartyIds.length) {
    mergeParties(await Party.find({ _id: { $in: votedPartyIds } }).lean());
  }

  if (partiesById.size <= 1) {
    const fallbackFilter = {
      status: "approved",
      isActive: true,
      $or: [{ electionId: election._id }, { isActive: true }, { status: "approved" }],
    };
    if (electionTypeRegex) {
      fallbackFilter.$or.push({ electionType: electionTypeRegex });
    }
    mergeParties(await Party.find(fallbackFilter).lean());
  }

  if (!party || !partiesById.has(party._id.toString())) {
    const ownParty = party?._id ? await Party.findById(party._id).lean() : null;
    if (ownParty?._id) mergeParties([ownParty]);
  }

  const ranking = [...partiesById.values()]
    .map((item) => ({
      partyId: item._id,
      name: item.name || "Unknown",
      logo: item.logo || item.symbol,
      color: item.color || "#7c7cff",
      development: item.development ?? item.goodWorkPercent ?? 0,
      votes: votesByPartyId.get(item._id.toString()) || 0,
    }))
    .sort((a, b) => {
      if (b.votes === a.votes) {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }
      return b.votes - a.votes;
    });

  const totalVotes = ranking.reduce((acc, cur) => acc + Number(cur.votes || 0), 0);
  const ownIndex = ranking.findIndex(
    (entry) => entry.partyId?.toString() === party?._id?.toString?.(),
  );

  return {
    totalVotes,
    ownVotes: ownIndex >= 0 ? Number(ranking[ownIndex]?.votes || 0) : 0,
    ownPosition: ownIndex >= 0 ? ownIndex + 1 : 0,
    totalParties: ranking.length,
    ranking,
  };
};

const computePartyWins = async (partyId) => {
  const endedElections = await Election.find(buildEndedElectionFilter())
    .select("_id")
    .lean();
  if (!endedElections.length) return 0;

  const endedIds = endedElections.map((item) => item._id);
  const voteAgg = await Vote.aggregate([
    { $match: { electionId: { $in: endedIds }, partyId: { $ne: null } } },
    {
      $group: {
        _id: {
          electionId: "$electionId",
          partyId: "$partyId",
        },
        votes: { $sum: 1 },
      },
    },
  ]);

  const byElection = voteAgg.reduce((acc, row) => {
    const electionId = row._id?.electionId?.toString?.();
    if (!electionId) return acc;
    if (!acc[electionId]) acc[electionId] = [];
    acc[electionId].push({
      partyId: row._id?.partyId?.toString?.(),
      votes: Number(row.votes || 0),
    });
    return acc;
  }, {});

  let wins = 0;
  endedElections.forEach((election) => {
    const rows = Array.isArray(byElection[election._id.toString()])
      ? byElection[election._id.toString()]
      : [];
    if (!rows.length) return;
    const topVotes = Math.max(...rows.map((item) => Number(item.votes || 0)));
    const ownVotes = Number(
      rows.find((item) => item.partyId === partyId.toString())?.votes || 0,
    );
    if (ownVotes > 0 && ownVotes === topVotes) wins += 1;
  });

  return wins;
};

// GET /api/party/profile/:partyId?
const getPartyProfileFull = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const election = await findRelevantElectionForParty(party);
    const electionWins = await computePartyWins(party._id);
    if (Number.isFinite(electionWins) && party.electionWins !== electionWins) {
      party.electionWins = electionWins;
      await party.save();
    }

    res.json({
      data: {
        id: party._id,
        name: party.name,
        leader: party.leader,
        vision: party.vision,
        manifesto: party.manifesto,
        logo: party.logo,
        teamMembers: party.teamMembers || [],
        establishedDate: party.establishedDate || null,
        headquarters: party.headquarters || "",
        totalMembers: Number(party.totalMembers || 0),
        electionWins,
        gallery: sanitizeGallery(party.gallery || []),
        contact: party.contact || {},
        socialMedia: party.socialMedia || {},
        goodWorkBreakdown: sanitizeBreakdown(party.goodWorkBreakdown).length
          ? sanitizeBreakdown(party.goodWorkBreakdown)
          : defaultGoodBreakdown(party),
        badWorkBreakdown: sanitizeBreakdown(party.badWorkBreakdown).length
          ? sanitizeBreakdown(party.badWorkBreakdown)
          : defaultBadBreakdown(party),
        isEditingLocked: isEditingLocked(election),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/party/profile/:partyId?
const updatePartyProfileFull = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const election = await findRelevantElectionForParty(party);
    if (isEditingLocked(election)) {
      return next(new AppError("Editing locked within 24 hours of election start", 403));
    }

    const allowed = [
      "name",
      "leader",
      "vision",
      "manifesto",
      "teamMembers",
      "logo",
      "establishedDate",
      "headquarters",
      "totalMembers",
      "gallery",
      "contact",
      "socialMedia",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "teamMembers") {
          party.teamMembers = sanitizeTeamMembers(req.body.teamMembers);
        } else if (field === "gallery") {
          party.gallery = sanitizeGallery(req.body.gallery);
        } else if (field === "totalMembers") {
          const numericValue = Number(req.body[field] || 0);
          party[field] = Number.isFinite(numericValue) ? numericValue : 0;
        } else if (field === "contact" || field === "socialMedia") {
          party[field] =
            req.body[field] && typeof req.body[field] === "object"
              ? req.body[field]
              : {};
        } else {
          party[field] = req.body[field];
        }
      }
    });

    await party.save();
    if (req.user?._id) {
      await Notification.create({
        userId: req.user._id,
        type: "info",
        title: "Profile updated",
        message: "Your party profile has been updated.",
      }).catch(() => {});
    }
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    next(error);
  }
};

// GET /api/party/future-plans/:partyId?
const getFuturePlans = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const election = await findRelevantElectionForParty(party);
    res.json({
      data: {
        futurePlans: party.futurePlans || [],
        isEditingLocked: isEditingLocked(election),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/party/future-plans/:partyId?
const updateFuturePlans = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const election = await findRelevantElectionForParty(party);
    if (isEditingLocked(election)) {
      return next(new AppError("Editing locked within 24 hours of election start", 403));
    }

    const { futurePlans } = req.body;
    if (!Array.isArray(futurePlans)) {
      return next(new AppError("futurePlans must be an array", 400));
    }
    if (futurePlans.length > 50) {
      return next(new AppError("Maximum 50 plans allowed", 400));
    }

    party.futurePlans = futurePlans.filter((p) => p && p.trim());
    await party.save();
    if (req.user?._id) {
      await Notification.create({
        userId: req.user._id,
        type: "info",
        title: "Future plans updated",
        message: "Your future plans have been updated.",
      }).catch(() => {});
    }
    res.json({ success: true, count: party.futurePlans.length });
  } catch (error) {
    next(error);
  }
};

// GET /api/party/progress/:partyId
const getProgress = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const development = party.development ?? party.goodWorkPercent ?? 0;
    const damage = 100 - development;
    const goodWorkBreakdown = sanitizeBreakdown(party.goodWorkBreakdown).length
      ? sanitizeBreakdown(party.goodWorkBreakdown)
      : defaultGoodBreakdown(party);
    const badWorkBreakdown = sanitizeBreakdown(party.badWorkBreakdown).length
      ? sanitizeBreakdown(party.badWorkBreakdown)
      : defaultBadBreakdown(party);
    res.json({
      data: {
        development,
        damage,
        goodWork: party.goodWork ?? party.goodWorkPercent ?? 0,
        badWork: party.badWork ?? party.badWorkPercent ?? 0,
        detailedMetrics: party.detailedMetrics || {},
        goodWorkBreakdown,
        badWorkBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/party/past-performance/:partyId
const getPastPerformance = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const partyId = party._id.toString();
    const now = new Date();
    const endedElections = await Election.find(buildEndedElectionFilter())
      .select("_id title endDate type participatingParties")
      .lean();
    const endedElectionIds = endedElections.map((item) => item._id);
    const voteAgg = endedElectionIds.length
      ? await Vote.aggregate([
          { $match: { electionId: { $in: endedElectionIds }, partyId: { $ne: null } } },
          {
            $group: {
              _id: {
                electionId: "$electionId",
                partyId: "$partyId",
              },
              votes: { $sum: 1 },
            },
          },
        ])
      : [];

    const linkedParties = endedElectionIds.length
      ? await Party.find({ electionId: { $in: endedElectionIds } })
          .select("_id electionId")
          .lean()
      : [];
    const linkedByElection = linkedParties.reduce((acc, row) => {
      const electionId = row?.electionId?.toString?.();
      const partyRef = row?._id?.toString?.();
      if (!electionId || !partyRef) return acc;
      if (!acc[electionId]) acc[electionId] = new Set();
      acc[electionId].add(partyRef);
      return acc;
    }, {});

    const byElection = voteAgg.reduce((acc, row) => {
      const key = row._id?.electionId?.toString();
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        partyId: row._id?.partyId?.toString(),
        votes: Number(row.votes || 0),
      });
      return acc;
    }, {});

    const electionHistory = await Promise.all(
      endedElections.map(async (election) => {
        const electionId = election._id.toString();
        const rows = Array.isArray(byElection[electionId]) ? byElection[electionId] : [];
        const voteMap = new Map(rows.map((item) => [item.partyId, Number(item.votes || 0)]));

        const participatingIds = Array.isArray(election.participatingParties)
          ? election.participatingParties
              .map((item) => item?.partyId?.toString?.() || item?.partyId || "")
              .filter(Boolean)
          : [];

        const candidateIds = new Set([
          ...rows.map((item) => item.partyId).filter(Boolean),
          ...participatingIds,
          ...[...(linkedByElection[electionId] || [])],
        ]);

        const ownVotes = Number(voteMap.get(partyId) || 0);
        const ownParticipated = candidateIds.has(partyId) || ownVotes > 0;
        if (!ownParticipated) return null;
        candidateIds.add(partyId);

        const ranking = [...candidateIds]
          .map((candidatePartyId) => ({
            partyId: candidatePartyId,
            votes: Number(voteMap.get(candidatePartyId) || 0),
          }))
          .sort((a, b) => {
            if (b.votes === a.votes) return a.partyId.localeCompare(b.partyId);
            return b.votes - a.votes;
          });

        const ownIndex = ranking.findIndex((item) => item.partyId === partyId);
        const yearSource = election.endDate ? new Date(election.endDate) : new Date();
        const totalParties = ranking.length;
        const position = ownIndex >= 0 ? ownIndex + 1 : 0;

        return {
          electionId,
          year: yearSource.getFullYear(),
          election: election.title || "Election",
          votes: ownVotes,
          position,
          totalParties,
          won: ownIndex === 0 && ownVotes > 0,
          sortDate: election.endDate || election.createdAt || null,
        };
      }),
    );

    const voteBasedHistory = electionHistory
      .filter(Boolean)
      .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

    const historicalRows = Array.isArray(party.historicalData)
      ? party.historicalData
          .map((row) => ({
            electionId: row?.electionId?.toString?.() || "",
            year: Number(row?.year || 0) || 0,
            election: row?.label || `Election ${row?.year || ""}`,
            votes: Number(row?.votes || 0),
            position: row?.won ? 1 : Number(row?.position || 0),
            totalParties: Number(row?.totalParties || 0),
            won: Boolean(row?.won),
          }))
          .filter((row) => row.year || row.electionId || row.votes > 0 || row.won)
      : [];

    const historicalElectionIds = [
      ...new Set(
        historicalRows.map((row) => row.electionId).filter(Boolean),
      ),
    ];
    const historicalElectionRefs = historicalElectionIds.length
      ? await Election.find({ _id: { $in: historicalElectionIds } })
          .select("_id title status isEnded allowVoting startDate endDate")
          .lean()
      : [];
    const historicalStatusById = new Map(
      historicalElectionRefs.map((item) => [
        item._id.toString(),
        deriveElectionStatus(item),
      ]),
    );

    const normalizedHistoricalRows = historicalRows.map((row) => {
      const status = row.electionId
        ? historicalStatusById.get(row.electionId) || "Ended"
        : "Ended";

      return {
        ...row,
        status,
        won: status === "Ended" ? Boolean(row.won) : false,
        sortDate: row.sortDate || null,
      };
    });

    const mergedByKey = new Map();
    normalizedHistoricalRows.forEach((row) => {
      const key = row.electionId || `${row.year}-${row.election}`;
      mergedByKey.set(key, row);
    });
    voteBasedHistory.forEach((row) => {
      const key = row.electionId || `${row.year}-${row.election}`;
      mergedByKey.set(key, { ...row, status: "Ended" });
    });

    const mergedHistory = [...mergedByKey.values()]
      .filter((row) => row.year || row.election)
      .sort((a, b) => {
        const aTime = a.sortDate ? new Date(a.sortDate).getTime() : 0;
        const bTime = b.sortDate ? new Date(b.sortDate).getTime() : 0;
        if (bTime !== aTime) return bTime - aTime;
        return Number(b.year || 0) - Number(a.year || 0);
      });

    const completedHistory = mergedHistory.filter(
      (item) => String(item.status || "Ended").toLowerCase() === "ended",
    );

    const relevantElection = await findRelevantElectionForParty(party, now);
    let currentElectionRow = null;

    if (relevantElection) {
      const currentStatus = deriveElectionStatus(relevantElection, now);
      if (currentStatus !== "Ended") {
        const currentStats = await buildElectionPartyRanking(relevantElection, party);
        const ownVotes = Number(currentStats.ownVotes || 0);
        const ownPosition = Number(currentStats.ownPosition || 0);
        const totalParties = Number(currentStats.totalParties || 0);
        const yearSource =
          relevantElection.startDate || relevantElection.endDate || relevantElection.createdAt;

        currentElectionRow = {
          electionId: relevantElection._id.toString(),
          year:
            yearSource && !Number.isNaN(new Date(yearSource).getTime())
              ? new Date(yearSource).getFullYear()
              : new Date().getFullYear(),
          election: relevantElection.title || "Election",
          votes: ownVotes,
          position: ownPosition,
          totalParties,
          won: false,
          status: currentStatus,
          sortDate: relevantElection.startDate || relevantElection.createdAt || null,
        };
      }
    }

    const endedHistory = completedHistory.slice(0, 2);
    const finalHistory = [
      ...(currentElectionRow ? [currentElectionRow] : []),
      ...endedHistory.filter(
        (item) => String(item.electionId || "") !== String(currentElectionRow?.electionId || ""),
      ),
    ];

    const totalWins = completedHistory.filter((item) => item.won).length;
    const averageVotes =
      completedHistory.length > 0
        ? Math.round(
            completedHistory.reduce((acc, current) => acc + Number(current.votes || 0), 0) /
              completedHistory.length,
          )
        : 0;
    const winRate =
      completedHistory.length > 0
        ? `${((totalWins / completedHistory.length) * 100).toFixed(1)}%`
        : "0%";

    if (party.electionWins !== totalWins) {
      party.electionWins = totalWins;
      await party.save();
    }

    res.json({
      data: {
        pastElections: finalHistory,
        summary: {
          totalWins,
          averageVotes,
          winRate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/party/current-stats/:partyId
const getCurrentStats = async (req, res, next) => {
  try {
    const party = await resolveParty(req);
    const now = new Date();

    const election = await findRelevantElectionForParty(party, now);

    if (!election) {
      const emptyStats = {
        ownVotes: 0,
        ownPosition: 0,
        voteShare: 0,
        leadOverSecond: 0,
      };
      return res.json({
        data: {
          currentElection: null,
          stats: emptyStats,
          metrics: emptyStats,
          allParties: [],
          totalVotes: 0,
        },
      });
    }

    const currentRanking = await buildElectionPartyRanking(election, party);
    const sorted = currentRanking.ranking;
    const totalVotes = Number(currentRanking.totalVotes || 0);
    const own = sorted.find((p) => p.partyId?.toString() === party._id.toString()) || { votes: 0 };
    const ownPosition = Number(currentRanking.ownPosition || 0) - 1;
    const voteShare = totalVotes ? Number(((own.votes / totalVotes) * 100).toFixed(2)) : 0;
    const leadOverSecond =
      sorted.length > 1 ? (ownPosition === 0 ? own.votes - sorted[1].votes : 0) : own.votes;

    res.json({
      data: {
        currentElection: {
          id: election._id,
          title: election.title || election.name || "Election",
          status: deriveElectionStatus(election, now),
          startDate: election.startDate,
          endDate: election.endDate,
        },
        stats: {
          ownVotes: own.votes || 0,
          ownPosition: ownPosition >= 0 ? ownPosition + 1 : 0,
          voteShare,
          leadOverSecond,
        },
        allParties: sorted.map((p, idx) => ({
          name: p.name,
          votes: p.votes,
          position: idx + 1,
          isOwn: p.partyId?.toString() === party._id.toString(),
          logo: p.logo,
          color: p.color,
          development: p.development,
        })),
        totalVotes,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPartyProfileFull,
  updatePartyProfileFull,
  getFuturePlans,
  updateFuturePlans,
  getProgress,
  getPastPerformance,
  getCurrentStats,
};
