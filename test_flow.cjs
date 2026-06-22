const axios = require('axios');
(async () => {
  try {
    const resStaff = await axios.post('http://localhost:5000/api/auth/login', { email: 'staff@gmail.com', password: 'password123' });
    const staffToken = resStaff.data.token;
    
    await axios.post('http://localhost:5000/api/attendance', [
      {
        studentId: 'IT2026-001',
        studentName: 'SARATH',
        department: 'Information Technology',
        semester: 'Sem 6',
        attendanceDate: new Date().toISOString(),
        periodId: 'Period 1 (09:00 - 10:00)',
        status: 'Present',
        subjectId: 'Web Technologies',
        markedBy: 'Mr.STAFF'
      }
    ], { headers: { Authorization: 'Bearer ' + staffToken } });
    console.log('Marked attendance.');
    
    const resStud = await axios.post('http://localhost:5000/api/auth/login', { email: 'sarath@gmail.com', password: 'password123' });
    const studToken = resStud.data.token;
    
    const r = await axios.get('http://localhost:5000/api/attendance/student/IT2026-001', { headers: { Authorization: 'Bearer ' + studToken } });
    console.log('Attendance:', r.data);
  } catch(e) {
    console.error(e.response?.data || e.message);
  }
})();
