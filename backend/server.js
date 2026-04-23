// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
require("./config/firebase"); // Initialize Firebase Admin

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes"); // ← Move import here

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// ─── Database ─────────────────────────────────────────────────────────────────
connectDB();

// Get Firebase Admin instance
const admin = require('firebase-admin');

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================

// Root route
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Server is running",
    mongodb: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected',
    firebase: admin.apps.length ? '✅ Initialized' : '❌ Not initialized'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ Backend is running',
    mongodb: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected',
    firebase: admin.apps.length ? '✅ Initialized' : '❌ Not initialized',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Backend status
app.get('/api/backend-status', (req, res) => {
  res.json({
    server: '✅ Running',
    mongodb: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected',
    firebase: admin.apps.length ? '✅ Initialized' : '❌ Not initialized',
    firebaseProject: admin.apps.length ? admin.app().options.projectId : null,
    timestamp: new Date().toISOString()
  });
});

// MongoDB test
app.get('/api/test-mongodb', async (req, res) => {
  try {
    const testCollection = mongoose.connection.collection('test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date() 
    });
    
    const count = await testCollection.countDocuments();
    
    res.json({
      success: true,
      message: '✅ MongoDB is working!',
      documentCount: count
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// PROTECTED ROUTES (Auth Required)
// ============================================

// Token verification middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify token endpoint
app.post('/api/verify-token', verifyToken, (req, res) => {
  res.json({
    success: true,
    status: '✅ Token valid',
    user: {
      uid: req.user.uid,
      email: req.user.email
    }
  });
});

// Protected route
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    message: '✅ You have access to protected data!',
    user: {
      uid: req.user.uid,
      email: req.user.email
    },
    secretData: 'This is protected information'
  });
});

// User profile
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const User = mongoose.model('User', new mongoose.Schema({
      uid: String,
      email: String,
      name: String,
      createdAt: { type: Date, default: Date.now }
    }));
    
    let user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      user = await User.create({
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name || req.user.email.split('@')[0]
      });
    }
    
    res.json({
      success: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        profile: user
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER ROUTES (from routes/userRoutes.js)
// ============================================
app.use("/api", userRoutes);

// ============================================
// TASK ROUTES (MOVE THESE BEFORE 404 HANDLER)
// ============================================
app.use("/api/tasks", taskRoutes); // ← MOVED HERE

// ============================================
// 404 HANDLER (Keep at the end)
// ============================================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ============================================
// START SERVER (Keep at the very end)
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Export for testing
module.exports = app;