import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied by Vite → http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    let token = null;
    try {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        token = sessionStorage.getItem('admin_token');
      } else if (path.startsWith('/subadmin')) {
        token = sessionStorage.getItem('subadmin_token');
      } else if (path.startsWith('/principal')) {
        token = sessionStorage.getItem('principal_token');
      } else if (path.startsWith('/hod')) {
        token = sessionStorage.getItem('hod_token');
      } else if (path.startsWith('/staff')) {
        token = sessionStorage.getItem('staff_token');
      } else if (path.startsWith('/student')) {
        token = sessionStorage.getItem('student_token');
      } else if (path.startsWith('/parent')) {
        token = sessionStorage.getItem('parent_token');
      } else if (path.startsWith('/accounts')) {
        token = sessionStorage.getItem('accounts_token');
      } else {
        // Fallback: Check all in priority
        token = sessionStorage.getItem('admin_token')
          || sessionStorage.getItem('subadmin_token')
          || sessionStorage.getItem('principal_token')
          || sessionStorage.getItem('hod_token')
          || sessionStorage.getItem('staff_token')
          || sessionStorage.getItem('student_token')
          || sessionStorage.getItem('parent_token')
          || sessionStorage.getItem('accounts_token')
          || sessionStorage.getItem('token');
      }
    } catch (e) {
      console.error('Error fetching token from storage', e);
    }
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to catch 401 Unauthorized errors (session expired/database reset)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not trigger session expiry redirect if the 401 comes from a login attempt (which just means bad credentials)
      if (error.config && error.config.url && error.config.url.includes('/login')) {
        return Promise.reject(error);
      }
      
      console.warn('Session expired or unauthorized! Clearing session storage and redirecting to login...');
      const keys = [
        'admin_token', 'subadmin_token', 'principal_token', 'hod_token', 'staff_token', 'student_token', 'parent_token', 'accounts_token',
        'admin_session', 'subadmin_session', 'principal_session', 'hod_session', 'staff_session', 'student_session', 'parent_session', 'accounts_session'
      ];
      keys.forEach(k => sessionStorage.removeItem(k));
      
      // Prevent infinite redirect loops if already on login page
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);


// Auth Endpoints
export const loginUser = (credentials) => api.post('/auth/login', {
  email: credentials.email?.trim().toLowerCase(),
  password: credentials.password?.trim()
});
export const getMyProfile = () => api.get('/auth/me');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

// Student Endpoints
export const getStudents = () => api.get('/students');
export const getStudentById = (id) => api.get(`/students/${id}`);
export const createStudent = (studentData) => api.post('/students', studentData);
export const updateStudent = (id, studentData) => api.put(`/students/${id}`, studentData);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Staff Endpoints
export const getStaff = () => api.get('/staff');
export const getStaffForPayroll = () => api.get('/staff/payroll-list');
export const createStaff = (staffData) => api.post('/staff', staffData);
export const updateStaff = (id, staffData) => api.put(`/staff/${id}`, staffData);
export const approveStaff = (id) => api.put(`/staff/${id}/approve`);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

// Timetable Endpoints
export const getTimetable = (dept, sem) => api.get(`/timetable?dept=${encodeURIComponent(dept)}&sem=${encodeURIComponent(sem)}`);
export const publishTimetable = (timetableData) => api.post('/timetable', timetableData);

// Department Endpoints
export const getDepartments = () => api.get('/departments');
export const createDepartment = (deptData) => api.post('/departments', deptData);
export const updateDepartment = (id, deptData) => api.put(`/departments/${id}`, deptData);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);

// Attendance Endpoints
export const getAllAttendance = () => api.get('/attendance');
export const getAttendanceByStudent = (studentId) => api.get(`/attendance/student/${studentId}`);
export const createAttendance = (attendanceData) => api.post('/attendance', attendanceData);
export const updateAttendance = (id, attendanceData) => api.put(`/attendance/${id}`, attendanceData);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);

// Marks Endpoints
export const getAllMarks = () => api.get('/marks');
export const getMarksByStudent = (studentId) => api.get(`/marks/student/${studentId}`);
export const createMark = (markData) => api.post('/marks', markData);
export const updateMark = (id, markData) => api.put(`/marks/${id}`, markData);
export const deleteMark = (id) => api.delete(`/marks/${id}`);

// Fees Endpoints
export const getAllFees = () => api.get('/fees');
export const getFeesByStudent = (studentId) => api.get(`/fees/student/${studentId}`);
export const createFee = (feeData) => api.post('/fees', feeData);
export const updateFee = (id, feeData) => api.put(`/fees/${id}`, feeData);
export const deleteFee = (id) => api.delete(`/fees/${id}`);

// Salary / Payroll Endpoints
export const getSalaries = () => api.get('/salaries');
export const getSalariesByStaff = (staffId) => api.get(`/salaries/staff/${staffId}`);
export const createSalary = (data) => api.post('/salaries', data);
export const updateSalary = (id, data) => api.put(`/salaries/${id}`, data);
export const deleteSalary = (id) => api.delete(`/salaries/${id}`);

// Expenses
export const getExpenses = () => api.get('/expenses');
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Reports Endpoints
export const getAttendanceReport = () => api.get('/reports/attendance');
export const getLowAttendanceReport = () => api.get('/reports/low-attendance');
export const getCgpaReport = () => api.get('/reports/cgpa');
export const getFeesReport = () => api.get('/reports/fees');
export const getPendingFeesReport = () => api.get('/reports/pending-fees');
export const getDepartmentsReport = () => api.get('/reports/departments');

// Library Management
export const getLibraryBooks = () => api.get('/library/books');
export const addLibraryBook = (data) => api.post('/library/books', data);
export const getLibraryIssues = () => api.get('/library/issues');
export const issueLibraryBook = (data) => api.post('/library/issues', data);
export const returnLibraryBook = (id, data) => api.put(`/library/issues/${id}/return`, data);

// Transport Management
export const getTransportRoutes = () => api.get('/transport/routes');
export const getTransportDrivers = () => api.get('/transport/drivers');
export const getTransportStudents = () => api.get('/transport/students');

// Hostel Management
export const getHostelBlocks = () => api.get('/hostel/blocks');
export const getHostelRooms = () => api.get('/hostel/rooms');
export const getHostelStudents = () => api.get('/hostel/students');
export const getHostelComplaints = () => api.get('/hostel/complaints');

// Placement Management
export const getPlacementCompanies = () => api.get('/placement/companies');
export const getPlacementJobs = () => api.get('/placement/jobs');
export const getPlacementApplications = () => api.get('/placement/applications');
export const getPlacementInterviews = () => api.get('/placement/interviews');
export const getPlacementSelections = () => api.get('/placement/selections');

// Settings & Security
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);
export const getLoginLogs = () => api.get('/settings/logs');

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all');

// Analytics
export const getAnalytics = () => api.get('/analytics');

// Dynamic User Management Endpoints (Admin Permissions/Parents management)
export const getUsers = () => api.get('/auth/users');
export const createUser = (userData) => api.post('/auth/users', userData);
export const updateUser = (id, userData) => api.put(`/auth/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);

// Principal Approvals Workflows
export const getApprovals = () => api.get('/approvals');
export const getPendingApprovals = () => api.get('/approvals/pending');
export const submitApprovalAction = (id, status, comments) => api.put(`/approvals/${id}`, { status, comments });

// AI Predictive Analytics
export const getAIInsights = () => api.get('/analytics/ai-insights');

// Unified Exam Timetable System
export const getExams = () => api.get('/exams');
export const createExam = (data) => api.post('/exams', data);
export const updateExam = (id, data) => api.put(`/exams/${id}`, data);
export const deleteExam = (id) => api.delete(`/exams/${id}`);

export default api;

// Assignments
export const getAssignments = (params) => api.get('/assignments', { params });
export const createAssignment = (assignmentData) => api.post('/assignments', assignmentData);
export const submitAssignment = (assignmentId, data) => api.post(`/assignments/${assignmentId}/submit`, data);
export const getAssignmentSubmissions = (assignmentId) => api.get(`/assignments/${assignmentId}/submissions`);
export const getStudentSubmissions = (studentId) => api.get(`/assignments/student/${studentId}`);
