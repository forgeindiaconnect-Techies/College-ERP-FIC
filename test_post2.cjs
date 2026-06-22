const axios = require('axios');
axios.post('http://localhost:5000/api/students', { name: 'Test', email: 'test999@test.com', dept: 'CSE', sem: 'Sem 1', id: 'CSE2026-999', hostelRequired: 'no', transportRequired: 'no' }, { headers: { Authorization: 'Bearer mock-admin' } })
  .then(res => console.log('SUCCESS:', res.data))
  .catch(err => console.error('ERROR:', err.response ? err.response.data : err.message));
