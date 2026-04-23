const Task = require("../models/Task");

// Get all tasks for authenticated user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = await Task.create({
      userId: req.user.uid,
      title,
      description,
      priority: priority || "medium",
      dueDate: dueDate || null
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.uid },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.uid });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };