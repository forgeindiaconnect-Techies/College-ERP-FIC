const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const token = jwt.sign({ id: '6a322cd7a1c90a42b821b569', role: 'Student', referenceId: 'IT2026-001', collegeId: 'COL012-8700665' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

axios.get('http://localhost:5000/api/attendance/student/IT2026-001', { headers: { Authorization: 'Bearer ' + token } })
.then(r => console.log('Attendance:', r.data))
.catch(e => console.error('Error:', e.response?.data || e.message));
