const Party = require("../models/Party");
const AppError = require("../utils/AppError");

// Get all parties for an election
const getParties = async (req, res, next) => {
  try {
    const { electionId } = req.query;

    if (!electionId) {
      return next(new AppError("Election ID is required", 400));
    }

    const parties = await Party.find({ electionId }).select(
      "_id name logo currentVotes electionType",
    );

    res.status(200).json({
      success: true,
      count: parties.length,
      parties,
    });
  } catch (error) {
    next(error);
  }
};

// Get party profile by ID
const getPartyProfile = async (req, res, next) => {
  try {
    const { partyId } = req.params;

    const party = await Party.findById(partyId);

    if (!party) {
      return next(new AppError("Party not found", 404));
    }

    // Format response according to expected structure
    const response = {
      _id: party._id,
      name: party.name,
      logo: party.logo,
      electionType: party.electionType,
      motivationQuote: party.motivationQuote,
      vision: party.vision,
      currentVotes: party.currentVotes,
      totalWins: party.totalWins,
      goodWorkPercent: party.goodWorkPercent,
      badWorkPercent: party.badWorkPercent,
      teamMembers: party.teamMembers,
    };

    res.status(200).json({
      success: true,
      party: response,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new party (admin only)
const createParty = async (req, res, next) => {
  try {
    const {
      name,
      logo,
      electionType,
      electionId,
      motivationQuote,
      vision,
      teamMembers,
    } = req.body;

    // Validate required fields
    if (!name || !electionType || !electionId) {
      return next(
        new AppError("Name, election type, and election ID are required", 400),
      );
    }

    // Check if party already exists
    const existingParty = await Party.findOne({ name, electionId });
    if (existingParty) {
      return next(new AppError("Party already exists in this election", 409));
    }

    const party = new Party({
      name,
      logo,
      electionType,
      electionId,
      motivationQuote,
      vision,
      teamMembers: teamMembers || [],
    });

    await party.save();

    res.status(201).json({
      success: true,
      message: "Party created successfully",
      party,
    });
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

    if (!party) {
      return next(new AppError("Party not found", 404));
    }

    // Update allowed fields
    if (name) party.name = name;
    if (logo) party.logo = logo;
    if (motivationQuote) party.motivationQuote = motivationQuote;
    if (vision) party.vision = vision;
    if (teamMembers) party.teamMembers = teamMembers;
    if (goodWorkPercent !== undefined) party.goodWorkPercent = goodWorkPercent;
    if (badWorkPercent !== undefined) party.badWorkPercent = badWorkPercent;

    await party.save();

    res.status(200).json({
      success: true,
      message: "Party updated successfully",
      party,
    });
  } catch (error) {
    next(error);
  }
};

// Delete party (admin only)
const deleteParty = async (req, res, next) => {
  try {
    const { partyId } = req.params;

    const party = await Party.findByIdAndDelete(partyId);

    if (!party) {
      return next(new AppError("Party not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Party deleted successfully",
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
};
