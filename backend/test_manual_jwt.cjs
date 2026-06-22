const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const token = jwt.sign({ id: '6a322696a1c90a42b821b561', role: 'Staff', collegeId: 'COL012-8700665' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

axios.post('http://localhost:5000/api/attendance', [
      {
        tenantId: 'COL012-8700665',
        studentId: 'IT2026-001',
        studentName: 'SARATH',
        department: 'Information Technology',
        semester: 'Sem 6',
        attendanceDate: new Date().toISOString(),
        periodId: '1',
        status: 'Present',
        subjectId: 'Web Technologies',
        markedBy: 'Mr.STAFF'
      }
    ], { headers: { Authorization: 'Bearer ' + token } })
.then(r => console.log('Success:', r.data))
.catch(e => console.error('Error:', e.response?.data || e.message));
