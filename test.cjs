const axios = require('axios');
(async () => {
  try {
    const login = await axios.post('http://localhost:5000/api/auth/login', { email: 'sabari@gmail.com', password: 'password123' });
    const res = await axios.get('http://localhost:5000/api/staff', { headers: { Authorization: `Bearer ${login.data.token}` } });
    console.log(res.data.map(s => `${s.name} - ${s.dept}`));
  } catch(err) {
    console.error(err.response?.data || err.message);
  }
})();
