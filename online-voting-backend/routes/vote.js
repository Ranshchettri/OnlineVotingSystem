const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { validateVote } = require("../validators/voteValidator");
const { castVote, getVotes } = require("../controllers/voteController");

router.post("/", protect, validateVote, castVote);
router.get("/", protect, adminOnly, getVotes);

module.exports = router;
