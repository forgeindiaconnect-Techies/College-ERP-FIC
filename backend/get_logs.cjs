const fs = require('fs');
// Let's just make a dummy request to check if it's logging errors
const axios = require('axios');
axios.get('http://localhost:5000/api/attendance').catch(e => console.log('Ping failed'));

