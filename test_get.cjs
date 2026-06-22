const axios = require('axios');
axios.get('http://localhost:5000/api/students', { headers: { Authorization: 'Bearer mock-admin' } })
  .then(res => console.log('FOUND:', res.data.filter(s => s.id === 'CSE2026-999')))
  .catch(err => console.error('ERROR:', err.response ? err.response.data : err.message));
