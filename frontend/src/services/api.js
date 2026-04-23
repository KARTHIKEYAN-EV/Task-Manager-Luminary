// src/services/api.js
// Handles all backend API communication

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Sends the Firebase JWT token to the backend to register/sync user data.
 * @param {string} token - Firebase ID token
 * @param {object} userData - Additional user data (displayName, email, etc.)
 */
export const syncUserWithBackend = async (token, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        createdAt: userData.metadata?.creationTime || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Backend sync failed");
    }

    return await response.json();
  } catch (err) {
    // Non-fatal: log and continue — the user is still authenticated via Firebase
    console.warn("Backend sync warning:", err.message);
    return null;
  }
};

/**
 * Fetches the authenticated user's profile from the backend.
 * @param {string} token - Firebase ID token
 */
export const fetchUserProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return await response.json();
};

/**
 * Generic authenticated GET helper.
 * @param {string} endpoint - API path (e.g. '/dashboard/stats')
 * @param {string} token - Firebase ID token
 */
export const authenticatedGet = async (endpoint, token) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return await response.json();
};
