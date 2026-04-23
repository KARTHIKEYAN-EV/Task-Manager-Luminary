// frontend/src/components/TestConnection.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';

const TestConnection = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResults(null);
    
    const testResults = [];
    
    try {
      // Test 1: Check if logged in
      const user = auth.currentUser;
      if (!user) {
        testResults.push('❌ Not logged in. Please sign in first.');
        setResults(testResults);
        setLoading(false);
        return;
      }
      testResults.push(`✅ Logged in as: ${user.email}`);
      
      // Test 2: Get Firebase token
      const token = await user.getIdToken();
      testResults.push(`✅ Got Firebase token: ${token.substring(0, 30)}...`);
      
      // Test 3: Test backend health
      try {
        const healthRes = await fetch('http://localhost:5000/api/backend-status');
        const healthData = await healthRes.json();
        testResults.push(`✅ Backend Health: ${JSON.stringify(healthData, null, 2)}`);
      } catch (error) {
        testResults.push(`❌ Backend health check failed: ${error.message}`);
      }
      
      // Test 4: Test authenticated endpoint
      try {
        const authRes = await fetch('http://localhost:5000/api/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const authData = await authRes.json();
        testResults.push(`✅ Token Verification: ${JSON.stringify(authData, null, 2)}`);
      } catch (error) {
        testResults.push(`❌ Token verification failed: ${error.message}`);
      }
      
      testResults.push('✨ Full Stack Test Complete!');
    } catch (error) {
      testResults.push(`❌ Test failed: ${error.message}`);
    }
    
    setResults(testResults);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>🔌 Full Stack Connection Test</h2>
      
      <button 
        onClick={runTest} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : '🧪 Test Backend Connection'}
      </button>
      
      {results && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          {results.map((result, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              {result}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Backend URL: http://localhost:5000</p>
        <p>Frontend URL: http://localhost:5173</p>
      </div>
    </div>
  );
};

export default TestConnection;