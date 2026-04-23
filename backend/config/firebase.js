const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

/**
 * Initializes Firebase Admin SDK.
 *
 * Priority:
 *  1. JSON service account file (FIREBASE_SERVICE_ACCOUNT_PATH)
 *  2. Individual env vars (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)
 */
const initializeFirebase = () => {
  if (admin.apps.length > 0) return; // Already initialized

  let credential;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath) {
    const resolvedPath = path.resolve(serviceAccountPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `Firebase service account file not found at: ${resolvedPath}`
      );
    }
    const serviceAccount = require(resolvedPath);
    credential = admin.credential.cert(serviceAccount);
    console.log("🔥 Firebase initialized via service account file");
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  ) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });
    console.log("🔥 Firebase initialized via environment variables");
  } else {
    throw new Error(
      "Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT_PATH or " +
        "FIREBASE_PROJECT_ID + FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL in .env"
    );
  }

  admin.initializeApp({ credential });
};

initializeFirebase();

module.exports = admin;
