const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { castVote, getVotes } = require("../controllers/voteController");

router.post("/", protect, castVote);
router.get("/", protect, adminOnly, getVotes);

module.exports = router;
