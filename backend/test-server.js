// test-backend.js
const mongoose = require('mongoose');
require('dotenv').config();

async function testBackend() {
  console.log('🔍 Testing Backend Connections...\n');
  
  // Test MongoDB
  console.log('1️⃣ Testing MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ MongoDB Connected');
    console.log(`   Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.log('   ❌ MongoDB Failed:', error.message);
  }
  
  // Test Firebase Admin
  console.log('\n2️⃣ Testing Firebase Admin...');
  try {
    const admin = require('firebase-admin');
    if (admin.apps.length) {
      console.log('   ✅ Firebase Admin Initialized');
      console.log(`   Project: ${admin.app().options.projectId}`);
    } else {
      console.log('   ❌ Firebase not initialized');
    }
  } catch (error) {
    console.log('   ❌ Firebase Error:', error.message);
  }
  
  // Test Environment
  console.log('\n3️⃣ Environment Check...');
  console.log(`   PORT: ${process.env.PORT || 5000}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Firebase Service Account: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? '✅ Set' : '❌ Missing'}`);
  
  console.log('\n✨ Test Complete!\n');
  process.exit(0);
}

testBackend();