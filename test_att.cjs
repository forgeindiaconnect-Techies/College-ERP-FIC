const axios = require('axios');
axios.post('http://localhost:5000/api/auth/login', { email: 'sarath@gmail.com', password: 'password123' }).then(res => {
  const token = res.data.token;
  console.log('Logged in:', res.data.referenceId);
  axios.get('http://localhost:5000/api/attendance/student/IT2026-001', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => console.log('Attendance:', r.data))
    .catch(err => console.error('Error fetching attendance:', err.response?.data || err.message));
});
