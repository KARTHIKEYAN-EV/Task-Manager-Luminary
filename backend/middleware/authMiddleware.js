const admin = require("../config/firebase");

/**
 * Middleware to verify Firebase JWT tokens.
 *
 * Expects: Authorization: Bearer <firebase_id_token>
 *
 * On success: attaches decoded token to req.user and calls next()
 * On failure: returns 401 Unauthorized
 */
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or malformed Authorization header. Expected: Bearer <token>",
    });
  }

  const idToken = authHeader.split("Bearer ")[1].trim();

  if (!idToken) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Token is empty",
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // { uid, email, name, ... }
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error.code, error.message);

    const messages = {
      "auth/id-token-expired": "Token has expired. Please sign in again.",
      "auth/id-token-revoked": "Token has been revoked. Please sign in again.",
      "auth/argument-error": "Invalid token format.",
    };

    return res.status(401).json({
      error: "Unauthorized",
      message: messages[error.code] || "Invalid or expired token",
    });
  }
};

module.exports = verifyFirebaseToken;
