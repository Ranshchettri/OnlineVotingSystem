const Task = require("../models/Task");
const Candidate = require("../models/Candidate");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/email");

// Create Task (Admin only)
const createTask = async (req, res, next) => {
  try {
    const { candidateId, title, description } = req.body;

    // Check candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return next(new AppError("Candidate not found", 404));

    const task = await Task.create({
      candidateId,
      title,
      description,
      completionPercentage: 0, // initially 0
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ status: "success", data: task });
  } catch (err) {
    next(err);
  }
};

// Update Task Completion (Admin only)
const verifyTask = async (req, res, next) => {
  try {
    const { taskId, completionPercentage } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return next(new AppError("Task not found", 404));

    task.completionPercentage = completionPercentage;
    task.verified = true;
    task.updatedAt = new Date();

    await task.save();

    // Update candidate totalTaskCompletion %
    const tasks = await Task.find({ candidateId: task.candidateId });
    const total = tasks.reduce((acc, t) => acc + t.completionPercentage, 0);
    const avgCompletion = total / tasks.length;

    await Candidate.findByIdAndUpdate(task.candidateId, {
      totalTaskCompletion: avgCompletion,
      updatedAt: new Date(),
    });

    // Send email notification to candidate
    const candidate = await Candidate.findById(task.candidateId);
    const candidateUser = await User.findOne({ _id: candidate.userId }); // assuming candidate linked to user

    if (candidateUser && candidateUser.email) {
      await sendEmail({
        to: candidateUser.email,
        subject: "Task Verified ",
        html: `
          <h3>Hi ${candidate.fullName},</h3>
          <p>Your task "${task.title}" has been verified by the admin.</p>
          <p>Current overall task completion: ${avgCompletion.toFixed(2)}%</p>
        `,
      });
    }

    res
      .status(200)
      .json({ status: "success", message: "Task verified", data: task });
  } catch (err) {
    next(err);
  }
};

// Get Tasks for a Candidate (User/Admin)
const getTasks = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const tasks = await Task.find({ candidateId });
    res.status(200).json({ status: "success", data: tasks });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, verifyTask, getTasks };
