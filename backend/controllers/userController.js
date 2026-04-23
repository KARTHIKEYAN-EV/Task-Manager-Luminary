const User = require("../models/User");

/**
 * POST /api/save-user
 *
 * Saves a new user or returns the existing one (upsert by firebaseUID).
 * Does NOT require authentication — the client sends name/email/firebaseUID
 * immediately after Firebase sign-up/sign-in.
 *
 * Body: { name, email, firebaseUID }
 */
const saveUser = async (req, res) => {
  try {
    const { name, email, firebaseUID } = req.body;

    // ── Validate required fields ───────────────────────────────────────────
    if (!name || !email || !firebaseUID) {
      return res.status(400).json({
        error: "Bad Request",
        message: "name, email, and firebaseUID are required",
      });
    }

    // ── Upsert: create if not exists, return existing if already saved ─────
    const user = await User.findOneAndUpdate(
      { firebaseUID },
      { $setOnInsert: { name, email, firebaseUID, createdAt: new Date() } },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(201).json({
      message: "User saved successfully",
      user,
    });
  } catch (error) {
    // Duplicate email (not firebaseUID) edge case
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Conflict",
        message: "A user with this email already exists",
      });
    }

    console.error("saveUser error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to save user",
    });
  }
};

/**
 * GET /api/user-data  [PROTECTED]
 *
 * Returns the MongoDB user document for the authenticated Firebase user.
 * req.user is set by verifyFirebaseToken middleware.
 */
const getUserData = async (req, res) => {
  try {
    const { uid } = req.user; // Decoded Firebase token

    const user = await User.findOne({ firebaseUID: uid });

    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found. Please call /api/save-user first.",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("getUserData error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve user data",
    });
  }
};

module.exports = { saveUser, getUserData };
