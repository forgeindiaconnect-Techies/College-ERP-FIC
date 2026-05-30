const axios = require('axios');
(async () => {
  try {
    // 1. Get Admin token
    const adminLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@college.edu',
      password: 'password123'
    });
    const token = adminLogin.data.token;
    
    console.log('Fixing Student Accounts...');
    // We cannot directly write to Mongoose from here because of in-memory DB.
    // Instead, I'll add a temporary repair endpoint to the backend.
  } catch(err) {
    console.log(err);
  }
})();
