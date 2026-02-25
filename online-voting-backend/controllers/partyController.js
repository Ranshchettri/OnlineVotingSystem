const Party = require("../models/Party");
const AppError = require("../utils/AppError");
const Election = require("../models/Election");

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

    const formatted = parties.map((p) => ({
      _id: p._id,
      electionId: p.electionId || null,
      name: p.name,
      shortName: p.shortName,
      leader: p.leader,
      email: p.email,
      mobile: p.mobile,
      symbol: p.symbol || p.logo || null,
      logo: p.logo,
      description: p.description || p.vision || p.motivationQuote || "",
      color: p.color || "#7c7cff",
      isActive: p.isActive === undefined ? true : p.isActive,
      status: (p.status || (p.isActive ? "approved" : "pending")).toUpperCase(),
      development: p.development ?? p.goodWorkPercent ?? 0,
      goodWork: p.goodWork ?? p.goodWorkPercent ?? 0,
      badWork: p.badWork ?? p.badWorkPercent ?? 0,
      totalVotes: p.currentVotes || 0,
      createdAt: p.createdAt,
    }));

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
      _id: party._id,
      electionId: party.electionId || null,
      name: party.name,
      shortName: party.shortName || "",
      leader: party.leader || "",
      email: party.email || "",
      mobile: party.mobile || "",
      symbol: party.symbol || party.logo || null,
      logo: party.logo || "",
      description:
        party.description || party.vision || party.motivationQuote || "",
      color: party.color || "#7c7cff",
      development: party.development ?? party.goodWorkPercent ?? 0,
      goodWork: party.goodWork ?? party.goodWorkPercent ?? 0,
      badWork: party.badWork ?? party.badWorkPercent ?? 0,
      totalVotes: party.currentVotes || 0,
      vision: party.vision || "",
      futurePlans: Array.isArray(party.futurePlans) ? party.futurePlans : [],
      teamMembers: Array.isArray(party.teamMembers) ? party.teamMembers : [],
      isActive: party.isActive,
      createdAt: party.createdAt,
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

    if (!name) {
      return next(new AppError("Name is required", 400));
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

    const party = new Party({
      name,
      shortName,
      leader,
      email,
      mobile,
      symbol,
      logo,
      description,
      color,
      isActive: isActive === undefined ? true : isActive,
      status: isActive ? "approved" : "pending",
      electionId: electionId || undefined,
      electionType,
      documents: Array.isArray(documents)
        ? documents
        : documents
          ? [documents]
          : [],
    });

    await party.save();

    const resp = {
      _id: party._id,
      name: party.name,
      symbol: party.symbol || party.logo || null,
      description:
        party.description || party.vision || party.motivationQuote || "",
      color: party.color || "#7c7cff",
      isActive: party.isActive,
      createdAt: party.createdAt,
    };

    res.status(201).json({ data: resp });
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
    const {
      name,
      logo,
      motivationQuote,
      vision,
      teamMembers,
      goodWorkPercent,
      badWorkPercent,
    } = req.body;

    const party = await Party.findById(partyId);

    if (!party) return next(new AppError("Party not found", 404));

    // Apply provided updates only
    Object.keys(req.body).forEach((key) => {
      party[key] = req.body[key];
    });

    if (party.status) {
      const normalized = party.status.toString().toLowerCase();
      if (
        ["approved", "rejected", "pending", "suspended"].includes(normalized)
      ) {
        party.status = normalized;
        if (normalized === "approved") party.isActive = true;
        if (normalized === "rejected" || normalized === "suspended")
          party.isActive = false;
      }
    }

    await party.save();

    const resp = {
      _id: party._id,
      name: party.name,
      shortName: party.shortName,
      leader: party.leader,
      email: party.email,
      mobile: party.mobile,
      symbol: party.symbol || party.logo || null,
      logo: party.logo,
      description:
        party.description || party.vision || party.motivationQuote || "",
      color: party.color || "#7c7cff",
      isActive: party.isActive,
      status: (
        party.status || (party.isActive ? "approved" : "pending")
      ).toUpperCase(),
      development: party.development ?? party.goodWorkPercent ?? 0,
      goodWork: party.goodWork ?? party.goodWorkPercent ?? 0,
      badWork: party.badWork ?? party.badWorkPercent ?? 0,
      totalVotes: party.currentVotes || 0,
      createdAt: party.createdAt,
    };

    res.status(200).json({ data: resp });
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

    res.status(200).json({ message: "Party deleted" });
  } catch (error) {
    next(error);
  }
};

// 🔴 GET PARTY DASHBOARD (Party Only)
const getPartyDashboard = async (req, res, next) => {
  try {
    let partyId = req.user.partyId;

    if (!partyId) {
      const first = await Party.findOne({}).sort({ createdAt: -1 });
      if (first?._id) {
        partyId = first._id;
      } else {
        return next(new AppError("Party ID not found in user profile", 400));
      }
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
    let partyId = req.user.partyId;
    if (!partyId) {
      const first = await Party.findOne({}).sort({ createdAt: -1 });
      if (first?._id) {
        partyId = first._id;
      } else {
        return next(new AppError("Party ID not found in user profile", 400));
      }
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
    let partyId = req.user.partyId;
    if (!partyId) {
      const first = await Party.findOne({}).sort({ createdAt: -1 });
      if (first?._id) {
        partyId = first._id;
      } else {
        return next(new AppError("Party ID not found in user profile", 400));
      }
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
    const partyId = req.user.partyId;

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
