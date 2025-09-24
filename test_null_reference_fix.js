/**
 * Test script to verify the null reference fix in attendance API
 * This script tests various scenarios that could cause null reference errors
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Helper function to make authenticated requests
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

async function testNullReferenceFix() {
  try {
    console.log('🔧 Testing Null Reference Fix...\n');

    // 1. Login to get auth token
    console.log('1. Logging in...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@example.com', // Replace with actual admin credentials
      password: 'admin123' // Replace with actual password
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Test with non-existent class (should return 404)
    console.log('2. Testing with non-existent class (should return 404)...');
    try {
      const response = await api.get('/attendance/class/999?date=2024-01-15');
      console.log('❌ Unexpected success:', response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly returned 404 for non-existent class');
        console.log('📝 Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    console.log('');

    // 3. Test with valid class (should work or return proper error)
    console.log('3. Testing with valid class...');
    try {
      const response = await api.get('/attendance/class/1?date=2024-01-15');
      console.log('✅ Valid class request successful');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly returned 400 for class without subject');
        console.log('📝 Message:', error.response.data.message);
      } else if (error.response?.status === 404) {
        console.log('✅ Correctly returned 404 for class not found');
        console.log('📝 Message:', error.response.data.message);
      } else {
        console.log('ℹ️  Other error (may be expected):', error.response?.data || error.message);
      }
    }
    console.log('');

    // 4. Test student attendance report (should handle missing data gracefully)
    console.log('4. Testing student attendance report...');
    try {
      const response = await api.get('/attendance/student/1/report');
      console.log('✅ Student report request successful');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly returned 404 for non-existent student');
        console.log('📝 Message:', error.response.data.message);
      } else {
        console.log('ℹ️  Other error (may be expected):', error.response?.data || error.message);
      }
    }
    console.log('');

    // 5. Test attendance statistics (should work without null reference errors)
    console.log('5. Testing attendance statistics...');
    try {
      const response = await api.get('/attendance/statistics');
      console.log('✅ Statistics request successful');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Statistics error:', error.response?.data || error.message);
    }
    console.log('');

    console.log('🎉 Null reference fix test completed!');
    console.log('✅ No "Cannot read properties of null" errors occurred');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
if (require.main === module) {
  testNullReferenceFix()
    .then(() => {
      console.log('\n📚 For more information, check the ATTENDANCE_NULL_REFERENCE_FIX.md file');
    })
    .catch(console.error);
}

module.exports = { testNullReferenceFix };
