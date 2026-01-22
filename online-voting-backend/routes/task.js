const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { createTask, getTasks } = require("../controllers/taskController");

router.post("/", protect, adminOnly, createTask);
router.get("/", protect, getTasks);

module.exports = router;
