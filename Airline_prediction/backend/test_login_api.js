const axios = require('axios');

const loginData = {
  email: 'vaishnavipulluri97@gmail.com',
  password: 'password_here' // I don't know the password, but the user says it's correct.
};

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:4001/api/auth/login', loginData);
    console.log('Login Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('Login Failed with response:', err.response.status, err.response.data);
    } else {
      console.log('Login Failed with error:', err.message);
    }
  }
}

testLogin();
