const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const token = jwt.sign({ id: '6a322696a1c90a42b821b561', role: 'Staff', collegeId: 'COL012-8700665' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

axios.get('http://localhost:5000/api/attendance', { headers: { Authorization: 'Bearer ' + token } })
.then(r => console.log('FETCHED:', r.data.map(a => a.subjectId + ' | ' + a.status)))
.catch(e => console.error('Error:', e.response?.data || e.message));
