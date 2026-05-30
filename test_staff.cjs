const axios = require('axios');
(async () => {
  try {
    const adminLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@college.edu',
      password: 'password123'
    });
    const token = adminLogin.data.token;

    const staffRes = await axios.get('http://localhost:5000/api/staff', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Staff in system:', staffRes.data.map(s => s.email));

    for (const s of staffRes.data) {
      if (!s.email) continue;
      try {
        const sLogin = await axios.post('http://localhost:5000/api/auth/login', {
          email: s.email,
          password: 'password123'
        });
        console.log('Login SUCCESS for:', s.email, 'Role:', sLogin.data.role);
      } catch (err) {
        console.log('Login FAILED for:', s.email, err.response?.status, err.response?.data);
      }
    }
  } catch (err) {
    console.error('Test failed:', err.response?.status, err.response?.data || err.message);
  }
})();
