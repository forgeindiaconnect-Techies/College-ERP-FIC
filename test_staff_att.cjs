const axios = require('axios');
(async () => {
  try {
    const resStaff = await axios.post('http://localhost:5000/api/auth/login', { email: 'staff@gmail.com', password: 'password123' });
    const staffToken = resStaff.data.token;
    
    const r = await axios.post('http://localhost:5000/api/attendance', [
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
    ], { headers: { Authorization: 'Bearer ' + staffToken } });
    console.log('Success:', r.data);
  } catch(e) {
    console.error('Error:', e.response?.data || e.message);
  }
})();
