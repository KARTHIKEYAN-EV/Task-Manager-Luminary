# Luminary — Firebase Auth App

A production-ready React authentication app with Firebase, protected routes, and a luxury dark dashboard UI.

---

## Project Structure

```
src/
├── components/
│   ├── AuthContext.js      # Global auth state (context + hooks)
│   └── ProtectedRoute.js  # Route guard for authenticated pages
├── pages/
│   ├── Login.js           # Login page
│   ├── Signup.js          # Sign up page
│   └── Dashboard.js       # Protected dashboard
├── services/
│   └── api.js             # Backend API calls (token sync, user fetch)
├── firebase.js            # Firebase app initialization
├── App.js                 # Router + route definitions
├── index.js               # React entry point
└── index.css              # Global styles (luxury dark theme)
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project → Add a Web App
3. Enable **Authentication → Email/Password** sign-in
4. Copy your config values into `src/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

Or use environment variables — copy `.env.example` to `.env` and fill in values, then reference them in `firebase.js`:

```js
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

### 3. Configure your backend URL

In `src/services/api.js`, set `API_BASE_URL` or set `REACT_APP_API_URL` in your `.env` file.

The app will call `POST /auth/sync` after every login/signup with:
- `Authorization: Bearer <firebase_jwt>`
- Body: `{ uid, email, displayName, photoURL, createdAt }`

### 4. Run the app

```bash
npm start
```

---

## Features

| Feature | Details |
|---|---|
| Auth | Firebase email + password |
| Token storage | `localStorage` (`firebaseToken`) |
| Token refresh | Auto-refreshed every 55 min |
| Protected routes | `ProtectedRoute` wrapper, redirects to `/login` |
| Backend sync | Sends JWT to your API on every login/signup |
| Form validation | Client-side with inline error messages |
| Error handling | Firebase error codes mapped to human-readable messages |
| Responsive | Sidebar hidden on mobile |

---

## Routes

| Path | Component | Protected |
|---|---|---|
| `/` | Redirects to `/login` | — |
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/dashboard` | Dashboard | ✅ Yes |

---

## Backend Integration

Your backend should:
1. Accept `POST /api/auth/sync` with `Authorization: Bearer <token>`
2. Verify the token with Firebase Admin SDK:
   ```js
   const decoded = await admin.auth().verifyIdToken(token);
   ```
3. Upsert the user in your database using `decoded.uid`

---

## Customization

- **Colors / theme**: Edit CSS variables at the top of `src/index.css`
- **App name**: Search-replace `Luminary` in `Dashboard.js` and `public/index.html`
- **Dashboard stats**: Hardcoded in `Dashboard.js` — replace with real API calls using `authenticatedGet()` from `services/api.js`
