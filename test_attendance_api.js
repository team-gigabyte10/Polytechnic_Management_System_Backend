/**
 * Attendance API Test Script
 * 
 * This script demonstrates how to use the Attendance API endpoints.
 * Make sure your server is running before executing this script.
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

// Test functions
async function testAttendanceAPI() {
  try {
    console.log('🚀 Starting Attendance API Tests...\n');

    // 1. Login to get auth token
    console.log('1. Logging in...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@example.com', // Replace with actual admin credentials
      password: 'admin123' // Replace with actual password
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Get attendance statistics
    console.log('2. Getting attendance statistics...');
    const statsResponse = await api.get('/attendance/statistics');
    console.log('📊 Statistics:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // 3. Get class attendance for today
    console.log('3. Getting class attendance for today...');
    const today = new Date().toISOString().split('T')[0];
    try {
      const classAttendanceResponse = await api.get(`/attendance/class/1?date=${today}`);
      console.log('📅 Class Attendance:', JSON.stringify(classAttendanceResponse.data, null, 2));
    } catch (error) {
      console.log('ℹ️  No attendance data for today (expected if no classes scheduled)');
    }
    console.log('');

    // 4. Get attendance rewards and fines
    console.log('4. Getting attendance rewards and fines...');
    const rewardsResponse = await api.get('/attendance/rewards-fines');
    console.log('💰 Rewards & Fines:', JSON.stringify(rewardsResponse.data, null, 2));
    console.log('');

    // 5. Get student attendance report
    console.log('5. Getting student attendance report...');
    try {
      const studentReportResponse = await api.get('/attendance/student/1/report');
      console.log('👨‍🎓 Student Report:', JSON.stringify(studentReportResponse.data, null, 2));
    } catch (error) {
      console.log('ℹ️  No student data available (expected if no students exist)');
    }
    console.log('');

    // 6. Get attendance calendar
    console.log('6. Getting attendance calendar...');
    try {
      const calendarResponse = await api.get('/attendance/class/1/calendar');
      console.log('📆 Calendar:', JSON.stringify(calendarResponse.data, null, 2));
    } catch (error) {
      console.log('ℹ️  No calendar data available (expected if no classes exist)');
    }
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Example of marking attendance (commented out as it requires valid class and student IDs)
async function markAttendanceExample() {
  try {
    console.log('📝 Example: Marking attendance...');
    
    const attendanceData = {
      classId: 1,
      date: new Date().toISOString().split('T')[0],
      attendanceList: [
        {
          studentId: 1,
          status: 'present'
        },
        {
          studentId: 2,
          status: 'late'
        },
        {
          studentId: 3,
          status: 'absent'
        }
      ]
    };

    // Uncomment the following lines when you have valid class and student IDs
    // const markResponse = await api.post('/attendance/mark', attendanceData);
    // console.log('✅ Attendance marked:', markResponse.data);
    
    console.log('ℹ️  Attendance marking example (requires valid class and student IDs)');
    console.log('📋 Data that would be sent:', JSON.stringify(attendanceData, null, 2));
    
  } catch (error) {
    console.error('❌ Mark attendance failed:', error.response?.data || error.message);
  }
}

// Run the tests
if (require.main === module) {
  testAttendanceAPI()
    .then(() => markAttendanceExample())
    .then(() => {
      console.log('\n🎉 Attendance API test script completed!');
      console.log('\n📚 For more information, check the ATTENDANCE_API_README.md file');
    })
    .catch(console.error);
}

module.exports = {
  testAttendanceAPI,
  markAttendanceExample
};
