const express = require("express");
const router = express.Router();

const { saveUser, getUserData } = require("../controllers/userController");
const verifyFirebaseToken = require("../middleware/authMiddleware");

// ── Public ────────────────────────────────────────────────────────────────────
// Save user to DB after Firebase sign-up / sign-in
router.post("/save-user", saveUser);

// ── Protected ─────────────────────────────────────────────────────────────────
// Fetch authenticated user's data
router.get("/user-data", verifyFirebaseToken, getUserData);

module.exports = router;
