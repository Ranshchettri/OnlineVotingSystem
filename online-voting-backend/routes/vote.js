const express = require("express");
const { castVote, getMyVotes } = require("../controllers/voteController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", protect, castVote);
router.get("/me", protect, getMyVotes);

module.exports = router;
