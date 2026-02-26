const Party = require("../models/Party");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const Election = require("../models/Election");

const estimateDataUrlSize = (dataUrl = "") => {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.includes(",")) return 0;
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
};

const normalizeEmail = (email = "") => String(email || "").trim().toLowerCase();
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = async (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return User.findOne({
    email: { $regex: `^${escapeRegex(normalized)}$`, $options: "i" },
  });
};

const ensurePartyAuthAccount = async (party) => {
  const normalizedEmail = normalizeEmail(party?.email);
  if (!party?._id || !normalizedEmail) return null;

  const linkedPartyUser = await User.findOne({
    role: "party",
    partyId: party._id,
  });
  const emailUser = await findUserByEmail(normalizedEmail);

  if (emailUser && emailUser.role !== "party") {
    throw new AppError("Email is already used by another non-party account", 409);
  }

  const targetUser = linkedPartyUser || emailUser;
  const isActiveParty =
    party.isActive !== false && String(party.status || "").toLowerCase() !== "rejected";

  if (targetUser) {
    targetUser.fullName = party.leader || party.name || targetUser.fullName;
    targetUser.email = normalizedEmail;
    targetUser.role = "party";
    targetUser.partyId = party._id;
    targetUser.isEmailVerified = true;
    targetUser.isVerified = isActiveParty;
    targetUser.verified = isActiveParty;
    targetUser.verificationStatus = isActiveParty ? "auto-approved" : "blocked";
    if (!targetUser.voterIdNumber) {
      targetUser.voterIdNumber = `PRTY-${party._id.toString().slice(-8).toUpperCase()}`;
    }
    await targetUser.save();
    return targetUser;
  }

  const randomPassword = crypto.randomBytes(18).toString("hex");
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  const createdUser = await User.create({
    fullName: party.leader || party.name || "Party Account",
    email: normalizedEmail,
    password: hashedPassword,
    role: "party",
    partyId: party._id,
    voterIdNumber: `PRTY-${party._id.toString().slice(-8).toUpperCase()}`,
    isEmailVerified: true,
    isVerified: isActiveParty,
    verified: isActiveParty,
    verificationStatus: isActiveParty ? "auto-approved" : "blocked",
  });

  return createdUser;
};

const normalizePartyDocuments = (documents = []) => {
  const source = Array.isArray(documents) ? documents : documents ? [documents] : [];

  return source
    .map((doc, index) => {
      if (!doc) return null;

      if (typeof doc === "string") {
        const mimeTypeMatch = doc.match(/^data:([^;,]+)[;,]/i);
        const mimeType = mimeTypeMatch?.[1] || "application/octet-stream";
        const extension = mimeType.includes("/")
          ? mimeType.split("/")[1].replace(/[^\w.-]/g, "")
          : "bin";

        return {
          name: `Document ${index + 1}.${extension || "bin"}`,
          mimeType,
          size: estimateDataUrlSize(doc),
          dataUrl: doc,
          uploadedAt: new Date(),
        };
      }

      if (typeof doc === "object") {
        const dataUrl =
          typeof doc.dataUrl === "string"
            ? doc.dataUrl
            : typeof doc.url === "string"
              ? doc.url
              : typeof doc.content === "string"
                ? doc.content
                : "";
        const mimeType =
          doc.mimeType ||
          doc.type ||
          (dataUrl.match(/^data:([^;,]+)[;,]/i)?.[1] || "application/octet-stream");

        return {
          name: doc.name || doc.fileName || `Document ${index + 1}`,
          mimeType,
          size: Number(doc.size || 0) || estimateDataUrlSize(dataUrl),
          dataUrl,
          uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
        };
      }

      return null;
    })
    .filter(Boolean);
};

const formatPartyStatus = (party) => {
  const raw = String(party.status || "").toLowerCase();
  const isBlocked = raw === "rejected" || raw === "blocked" || party.isActive === false;
  if (raw === "pending") return "PENDING";
  return isBlocked ? "BLOCKED" : "ACTIVE";
};

const formatPartyPayload = (party, index = 0) => ({
  _id: party._id,
  electionId: party.electionId || null,
  name: party.name,
  shortName: party.shortName,
  leader: party.leader,
  email: party.email,
  mobile: party.mobile,
  symbol: party.symbol || party.logo || null,
  logo: party.logo,
  description: party.description || party.vision || party.motivationQuote || "",
  color: party.color || "#7c7cff",
  isActive: party.isActive === undefined ? true : party.isActive,
  status: formatPartyStatus(party),
  development: party.development ?? party.goodWorkPercent ?? 0,
  goodWork: party.goodWork ?? party.goodWorkPercent ?? 0,
  badWork: party.badWork ?? party.badWorkPercent ?? 0,
  totalVotes: party.currentVotes || 0,
  documents: normalizePartyDocuments(party.documents || []),
  createdAt: party.createdAt,
  registeredAt: party.createdAt,
  rank: index + 1,
});

// Get all parties for an election
const getParties = async (req, res, next) => {
  try {
    const { electionId, status } = req.query;

    const filter = {};
    if (electionId) filter.electionId = electionId;
    if (status) {
      // Accept both lower/upper case and Active/Pending wording
      const normalized = status.toString().toLowerCase();
      if (normalized === "pending") filter.status = "pending";
      if (normalized === "approved" || normalized === "active")
        filter.status = "approved";
      if (normalized === "rejected" || normalized === "blocked")
        filter.status = "rejected";
    }

    const parties = await Party.find(filter).sort({ createdAt: -1 });

    const formatted = parties.map((p, index) => formatPartyPayload(p, index));

    res.status(200).json({ data: { parties: formatted } });
  } catch (error) {
    console.error("createParty failed", error);
    next(error);
  }
};

// Get party profile by ID
const getPartyProfile = async (req, res, next) => {
  try {
    const { partyId } = req.params;

    const party = await Party.findById(partyId);

    if (!party) return next(new AppError("Party not found", 404));

    const resp = {
      ...formatPartyPayload(party),
      vision: party.vision || "",
      futurePlans: Array.isArray(party.futurePlans) ? party.futurePlans : [],
      teamMembers: Array.isArray(party.teamMembers) ? party.teamMembers : [],
    };

    res.status(200).json({ data: { party: resp } });
  } catch (error) {
    next(error);
  }
};

// Create a new party (admin only)
const createParty = async (req, res, next) => {
  try {
    let { electionType, electionId } = req.body;
    const {
      name,
      symbol,
      description,
      color,
      isActive,
      leader,
      email,
      mobile,
      shortName,
      logo,
      documents,
    } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name) {
      return next(new AppError("Name is required", 400));
    }
    if (!normalizedEmail) {
      return next(new AppError("Email is required", 400));
    }

    if (normalizedEmail) {
      const conflictingUser = await findUserByEmail(normalizedEmail);
      if (conflictingUser && conflictingUser.role !== "party") {
        return next(new AppError("Email is already used by another non-party account", 409));
      }
    }

    // prevent duplicate names for same election if electionId provided
    if (electionId) {
      const existingParty = await Party.findOne({ name, electionId });
      if (existingParty) {
        return next(new AppError("Party already exists in this election", 409));
      }
    }

    // Auto-pick latest election if provided; otherwise allow null
    if (!electionId || electionId === "") {
      const latestElection = await Election.findOne({}).sort({ startDate: -1 });
      if (latestElection?._id) {
        electionId = latestElection._id;
        if (!electionType)
          electionType = latestElection.type || latestElection.electionType;
      }
    }
    if (!electionType) {
      electionType = "Political";
    }

    const resolvedIsActive = typeof isActive === "boolean" ? isActive : true;
    const normalizedDocuments = normalizePartyDocuments(documents || req.body.documentData);

    const party = new Party({
      name,
      shortName,
      leader,
      email: normalizedEmail,
      mobile,
      symbol,
      logo,
      description,
      color,
      isActive: resolvedIsActive,
      status: resolvedIsActive ? "approved" : "rejected",
      electionId: electionId || undefined,
      electionType,
      documents: normalizedDocuments,
    });

    await party.save();
    await ensurePartyAuthAccount(party);
    res.status(201).json({ data: formatPartyPayload(party) });
  } catch (error) {
    console.error("createParty failed", error);
    if (error.code === 11000) {
      return next(new AppError("Party with same name already exists", 409));
    }
    next(error);
  }
};

// Update party profile (admin only)
const updateParty = async (req, res, next) => {
  try {
    const { partyId } = req.params;
    const party = await Party.findById(partyId);

    if (!party) return next(new AppError("Party not found", 404));

    if (req.body.documents !== undefined) {
      party.documents = normalizePartyDocuments(req.body.documents);
    }

    // Apply provided updates only
    Object.keys(req.body).forEach((key) => {
      if (key === "documents") return;
      party[key] = req.body[key];
    });

    if (req.body.email !== undefined) {
      party.email = normalizeEmail(req.body.email);
      if (!party.email) {
        return next(new AppError("Email is required", 400));
      }
      if (party.email) {
        const conflictingUser = await findUserByEmail(party.email);
        if (conflictingUser && conflictingUser.role !== "party") {
          return next(new AppError("Email is already used by another non-party account", 409));
        }
      }
    }

    if (party.status) {
      const normalized = party.status.toString().toLowerCase();
      if (["approved", "rejected", "pending", "blocked"].includes(normalized)) {
        if (normalized === "approved") {
          party.status = "approved";
          party.isActive = true;
        } else if (normalized === "rejected" || normalized === "blocked") {
          party.status = "rejected";
          party.isActive = false;
        } else if (normalized === "pending") {
          party.status = "pending";
          party.isActive = false;
        }
      }
    }

    if (req.body.isActive !== undefined) {
      const resolvedIsActive = Boolean(req.body.isActive);
      party.isActive = resolvedIsActive;
      party.status = resolvedIsActive ? "approved" : "rejected";
    }

    await party.save();
    await ensurePartyAuthAccount(party);
    res.status(200).json({ data: formatPartyPayload(party) });
  } catch (error) {
    next(error);
  }
};

// Delete party (admin only)
const deleteParty = async (req, res, next) => {
  try {
    const { partyId } = req.params;

    const party = await Party.findByIdAndDelete(partyId);

    if (!party) return next(new AppError("Party not found", 404));

    await User.deleteMany({ role: "party", partyId: party._id });

    res.status(200).json({ message: "Party deleted" });
  } catch (error) {
    next(error);
  }
};

// 🔴 GET PARTY DASHBOARD (Party Only)
const resolvePartyIdForUser = async (user = {}) => {
  if (user?.partyId) return user.partyId;
  const normalizedEmail = normalizeEmail(user?.email);
  if (!normalizedEmail) return null;

  const partyByEmail = await Party.findOne({
    email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
  }).sort({ createdAt: -1 });

  if (!partyByEmail?._id) return null;

  await User.findByIdAndUpdate(user._id, { partyId: partyByEmail._id }).catch(
    () => {},
  );
  return partyByEmail._id;
};

const getPartyDashboard = async (req, res, next) => {
  try {
    const partyId = await resolvePartyIdForUser(req.user);
    if (!partyId) {
      return next(new AppError("Party ID not found in user profile", 400));
    }

    const party = await Party.findById(partyId).populate("electionId");
    const Candidate = require("../models/Candidate");

    if (!party) {
      return next(new AppError("Party not found", 404));
    }

    const election = party.electionId;
    let votePercentage = 0;

    if (election && election.totalVotes > 0) {
      votePercentage = (
        (party.currentVotes / election.totalVotes) *
        100
      ).toFixed(2);
    }

    // Get candidates from this party
    const candidates = await Candidate.find({ partyId }).select(
      "fullName profileImage",
    );

    res.status(200).json({
      data: {
        electionTitle: election?.name || "Unknown",
        votes: party.currentVotes || 0,
        rank: 1, // Will be calculated by frontend
        status: election?.isEnded ? "ENDED" : "ACTIVE",
        manifesto: party.manifesto || "",
        participatingElections: [
          {
            id: election?._id,
            name: election?.name,
            status: election?.isEnded ? "ENDED" : "ACTIVE",
          },
        ],
        candidates: candidates.map((c) => ({
          id: c._id,
          name: c.fullName,
          image: c.profileImage,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🔴 UPDATE PARTY PROFILE (LIMITED - Party Self Edit Only)
const updatePartyProfile = async (req, res, next) => {
  try {
    const partyId = await resolvePartyIdForUser(req.user);
    if (!partyId) {
      return next(new AppError("Party ID not found in user profile", 400));
    }

    // Only allow these fields to be updated
    const allowedFields = [
      "manifesto",
      "description",
      "logo",
      "coverImage",
      "socialLinks",
    ];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const party = await Party.findByIdAndUpdate(partyId, updates, {
      new: true,
    });

    if (!party) {
      return next(new AppError("Party not found", 404));
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// 🔴 GET PARTY ANALYTICS (Read-Only)
const getPartyAnalytics = async (req, res, next) => {
  try {
    const partyId = await resolvePartyIdForUser(req.user);
    if (!partyId) {
      return next(new AppError("Party ID not found in user profile", 400));
    }

    const party = await Party.findById(partyId);

    if (!party) {
      return next(new AppError("Party not found", 404));
    }

    const election = await Election.findById(party.electionId);

    if (!election) {
      return res.status(200).json({
        data: {
          votesByRegion: [],
          demographic: [],
          growthTrend: [],
          metrics: {
            totalVotes: 0,
            voteShare: 0,
            rank: 0,
            status: "PENDING",
          },
        },
      });
    }

    // Calculate rank
    const allParties = await Party.find({ electionId: party.electionId });
    const sortedByVotes = allParties.sort(
      (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0),
    );

    const rank =
      sortedByVotes.findIndex((p) => p._id.toString() === partyId.toString()) +
      1;
    const voteShare =
      election.totalVotes > 0
        ? ((party.currentVotes / election.totalVotes) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      data: {
        votesByRegion: [],
        demographic: [],
        growthTrend: [],
        metrics: {
          totalVotes: party.currentVotes || 0,
          voteShare: parseFloat(voteShare),
          rank,
          status: election?.isEnded ? "PUBLISHED" : "PENDING",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🔴 GET PARTY RESULTS
const getPartyResults = async (req, res, next) => {
  try {
    const partyId = await resolvePartyIdForUser(req.user);

    if (!partyId) {
      return next(new AppError("Party ID not found in user profile", 400));
    }

    const party = await Party.findById(partyId);

    if (!party) {
      return next(new AppError("Party not found", 404));
    }

    const election = await Election.findById(party.electionId);

    if (!election || !election.isEnded) {
      return res.status(200).json({
        data: {
          summary: {
            electionTitle: election?.name || "Unknown",
            totalVotes: party.currentVotes || 0,
            yourRank: 0,
            voteShare: 0,
          },
          results: [],
          winner: null,
        },
      });
    }

    // Get all results
    const allParties = await Party.find({ electionId: party.electionId });
    const sortedByVotes = allParties.sort(
      (a, b) => (b.currentVotes || 0) - (a.currentVotes || 0),
    );

    const yourRank =
      sortedByVotes.findIndex((p) => p._id.toString() === partyId.toString()) +
      1;
    const voteShare =
      election.totalVotes > 0
        ? ((party.currentVotes / election.totalVotes) * 100).toFixed(2)
        : 0;

    const results = sortedByVotes.map((p) => ({
      partyName: p.name,
      votes: p.currentVotes || 0,
      percentage:
        election.totalVotes > 0
          ? ((p.currentVotes / election.totalVotes) * 100).toFixed(2)
          : 0,
      isYourParty: p._id.toString() === partyId.toString(),
    }));

    const winner = sortedByVotes[0];

    res.status(200).json({
      data: {
        summary: {
          electionTitle: election.name,
          totalVotes: election.totalVotes,
          yourRank,
          voteShare: parseFloat(voteShare),
        },
        results,
        winner: {
          name: winner.name,
          votes: winner.currentVotes || 0,
          percentage:
            election.totalVotes > 0
              ? ((winner.currentVotes / election.totalVotes) * 100).toFixed(2)
              : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParties,
  getPartyProfile,
  createParty,
  updateParty,
  deleteParty,
  getPartyDashboard,
  updatePartyProfile,
  getPartyAnalytics,
  getPartyResults,
};
