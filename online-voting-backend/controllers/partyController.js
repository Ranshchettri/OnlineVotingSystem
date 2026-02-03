const Party = require("../models/Party");
const AppError = require("../utils/AppError");
const Election = require("../models/Election");

// Get all parties for an election
const getParties = async (req, res, next) => {
  try {
    const { electionId } = req.query;
    console.log(
      "partyController.getParties called - query:",
      req.query,
      "user:",
      req.user && req.user._id,
    );

    // Optional filter by electionId
    const filter = {};
    if (electionId) filter.electionId = electionId;

    const parties = await Party.find(filter).sort({ createdAt: -1 });

    const formatted = parties.map((p) => ({
      _id: p._id,
      name: p.name,
      symbol: p.symbol || p.logo || null,
      description: p.description || p.vision || p.motivationQuote || "",
      color: p.color || "#7c7cff",
      isActive: p.isActive === undefined ? true : p.isActive,
      createdAt: p.createdAt,
    }));

    res.status(200).json({ data: { parties: formatted } });
  } catch (error) {
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
      name: party.name,
      symbol: party.symbol || party.logo || null,
      description:
        party.description || party.vision || party.motivationQuote || "",
      color: party.color || "#7c7cff",
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
    const { electionType, electionId } = req.body;
    const { name, symbol, description, color, isActive } = req.body;

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

    const party = new Party({
      name,
      symbol,
      description,
      color,
      isActive: isActive === undefined ? true : isActive,
      electionId,
      electionType,
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
    const partyId = req.user.partyId;

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
    const partyId = req.user.partyId;

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
    const partyId = req.user.partyId;

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
