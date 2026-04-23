const express = require("express");
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");
const admin = require("firebase-admin");

// Auth middleware (reuse or define)
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.use(verifyToken); // protect all task routes

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;