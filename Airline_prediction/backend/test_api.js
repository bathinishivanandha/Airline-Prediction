const axios = require('axios');

async function testApi() {
  const email = process.argv[2] || 'vaishnavipulluri97@gmail.com';
  try {
    console.log(`Testing Forgot Password API for: ${email}...`);
    const response = await axios.post('http://localhost:4000/api/auth/forgot-password', {
      email: email
    });
    console.log('API Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
  }
}

testApi();
