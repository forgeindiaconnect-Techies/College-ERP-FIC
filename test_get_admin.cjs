const axios = require('axios');
axios.get('http://localhost:5000/api/students', { headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMmE0NGQ0OGZiY2I1OTQzYTM1MDk0NiIsImlhdCI6MTc4MTc3ODQwMiwiZXhwIjoxNzg0MzcwNDAyfQ.BEpVUgFedGCXV7nFdhuXM1x9WX7NSV6nfhdi2qgblKI' } })
  .then(res => console.log('FOUND:', res.data.length))
  .catch(err => console.error('ERROR:', err.response ? err.response.data : err.message));
