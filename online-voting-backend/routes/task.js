const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  validateTask,
  validateTaskVerification,
} = require("../validators/taskValidator");
const {
  createTask,
  verifyTask,
  getTasks,
} = require("../controllers/taskController");
const router = express.Router();

// Admin routes
router.post("/", protect, adminOnly, validateTask, createTask);
router.patch(
  "/verify",
  protect,
  adminOnly,
  validateTaskVerification,
  verifyTask,
);

// User/Admin view tasks
router.get("/:candidateId", protect, getTasks);

module.exports = router;
