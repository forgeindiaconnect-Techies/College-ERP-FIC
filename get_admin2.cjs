const axios = require('axios');
axios.post('http://localhost:5000/api/auth/login', { email: 'admin@college.edu', password: 'password123' })
  .then(res => console.log('Admin User:', res.data))
  .catch(err => console.error('ERROR:', err.response ? err.response.data : err.message));
