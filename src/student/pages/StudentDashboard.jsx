import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, CartesianGrid, Legend
} from 'recharts';
import {
  ClipboardList, BookOpen, AlertCircle, FileText, Bell,
  Percent, Calendar, ShieldAlert, Clock, MapPin, User, Briefcase
} from 'lucide-react';
import { 
  getStudentById, getAttendanceByStudent, 
  getMarksByStudent, getFeesByStudent, getExams,
  getTimetable, getNotifications, getMyLibraryTransactions
} from '../../api/index';
import useRealtimeSync from '../../hooks/useRealtimeSync';
import './StudentDashboard.css';

const DEPT_SUBJECTS = {
  'Computer Science Engineering': ['Data Structures', 'DBMS', 'Networks', 'OS', 'Machine Learning', 'AI', 'Cloud Computing', 'Cryptography'],
  'Information Technology': ['Web Technologies', 'Software Engineering', 'DBMS', 'Cyber Security', 'Data Science', 'IoT'],
  'Electronics & Communication Engineering': ['Circuits', 'Signals and Systems', 'Microprocessors', 'Digital Logic', 'VLSI Design', 'Antenna Theory'],
  'Cyber Security': ['Network Security', 'Cryptography', 'Ethical Hacking', 'Cyber Forensics', 'Malware Analysis'],
  'Artificial Intelligence & Data Science': ['Machine Learning', 'Deep Learning', 'Data Mining', 'Big Data Analytics', 'NLP']
};

// Fallbacks
const DEFAULT_STUDENT = {
  id: 'CS2022001',
  name: 'John Doe',
  dept: 'Cyber Security',
  sem: 'Semester 6',
  email: 'john@college.edu'
};

const PERIOD_TIMES = {
  1: '09:00 AM - 10:00 AM',
  2: '10:00 AM - 11:00 AM',
  3: '11:15 AM - 12:15 PM',
  4: '12:15 PM - 01:15 PM',
  5: '02:00 PM - 03:00 PM',
  6: '03:00 PM - 04:00 PM'
};

const getSubjectCode = (subject) => {
  if (!subject) return 'GEN101';
  const words = subject.split(' ');
  if (words.length === 1) return subject.substring(0, 3).toUpperCase() + '101';
  return words.map(w => w[0]).join('').toUpperCase() + '101';
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const studentIdRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [studentSession, setStudentSession] = useState(DEFAULT_STUDENT);

  // Student specific data
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentMarks, setStudentMarks] = useState(null);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [exams, setExams] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [scholarship, setScholarship] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [hasOverdueBooks, setHasOverdueBooks] = useState(false);
  const [overdueFines, setOverdueFines] = useState(0);

  useEffect(() => {
    const init = async () => {
      // 1. Session check
      const session = sessionStorage.getItem('student_session');
      let activeStud = DEFAULT_STUDENT;
      if (session) {
        activeStud = JSON.parse(session);
        setStudentSession(activeStud);
      } else {
        navigate('/student/login');
        return;
      }

      try {
        let studentId = activeStud.referenceId || activeStud.id || activeStud._id;
        
        // Ensure we are using the correct Register Number (like ST2026010), not a MongoDB _id
        if (studentId && studentId.length === 24 && /^[0-9a-fA-F]{24}$/.test(studentId)) {
          const erpStudents = JSON.parse(localStorage.getItem('erp_students') || '[]');
          const match = erpStudents.find(s => s._id === studentId || s.id === studentId);
          if (match && match.id) {
            studentId = match.id;
          }
        }

        studentIdRef.current = studentId; // track for real-time sync
        // Fetch real data in parallel
        const [studentRes, marksRes, feesRes, attendanceRes, examsRes, notifRes, libRes] = await Promise.all([
          getStudentById(studentId).catch(() => null),
          getMarksByStudent(studentId).catch(() => null),
          getFeesByStudent(studentId).catch(() => null),
          getAttendanceByStudent(studentId).catch(() => null),
          getExams().catch(() => ({ data: [] })),
          getNotifications().catch(() => ({ data: [] })),
          getMyLibraryTransactions().catch(() => ({ data: [] }))
        ]);

        if (notifRes?.data && Array.isArray(notifRes.data)) {
          setNotifications(notifRes.data);
        }

        if (libRes?.data && Array.isArray(libRes.data)) {
          const overdueBooks = libRes.data.filter(t => t.status === 'Overdue');
          if (overdueBooks.length > 0) {
            setHasOverdueBooks(true);
            const overdueTotal = overdueBooks.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);
            setOverdueFines(overdueTotal);
          }
        }

        let dbRecord = studentRes?.data || null;
        if (!dbRecord) {
          // Try to fetch from local storage if backend fails
          const erpStudents = JSON.parse(localStorage.getItem('erp_students') || '[]');
          const localMatch = erpStudents.find(s => s.rollNo === activeStud.id || s.id === activeStud.id);
          
          let localAtt = 85;
          if (localMatch && localMatch.attendance) {
            const parsed = parseInt(String(localMatch.attendance).replace('%', '').trim());
            if (!isNaN(parsed)) localAtt = parsed;
          }

          dbRecord = {
            id: activeStud.id, name: activeStud.name, dept: activeStud.dept, sem: activeStud.sem,
            attendance: localAtt, cgpa: 8.6, status: 'Active', feeStatus: 'Pending', email: activeStud.email
          };
        }

        // Dynamically override attendance if backend records exist
        if (attendanceRes?.data && attendanceRes.data.length > 0) {
          const presentDays = attendanceRes.data.filter(r => r.status.toLowerCase() === 'present').length;
          dbRecord.attendance = Math.round((presentDays / attendanceRes.data.length) * 100);
          
          const todayStr = new Date().toISOString().split('T')[0];
          const todayRecord = attendanceRes.data.find(r => r.date && r.date.toString().startsWith(todayStr));
          dbRecord.todayStatus = todayRecord ? (todayRecord.status.toLowerCase() === 'present' ? 'Present' : 'Absent') : 'Not Marked';
        } else {
          dbRecord.todayStatus = 'Not Marked';
        }
        
        setStudentDetails(dbRecord);

        if (examsRes?.data) {
          setExams(examsRes.data);
        }

        // Fetch timetable from API
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = dayNames[new Date().getDay()];
        try {
          // Normalize to match Timetable DB format, prioritizing the active session semester
          // so that the sidebar and the dashboard content remain perfectly synced.
          const targetSem = activeStud.sem || dbRecord.sem || 'Sem 3';
          let querySem = targetSem;
          if (querySem && querySem.startsWith('Sem ')) {
            querySem = querySem.replace('Sem ', 'Semester ');
          }

          // Force the visual dbRecord to match the active session so UI doesn't say "Sem 1" while querying "Sem 3"
          dbRecord.sem = targetSem;

          const targetDept = activeStud.dept || dbRecord.dept || 'Cyber Security';
          dbRecord.dept = targetDept;
          
          setStudentDetails(dbRecord);
          // also update the active session state if needed
          const updatedSession = {...activeStud, sem: targetSem, dept: targetDept};
          setStudentSession(updatedSession);
          sessionStorage.setItem('student_session', JSON.stringify(updatedSession));
          
          const ttRes = await getTimetable(targetDept, querySem);
          let todayClasses = [];
          if (ttRes.data && ttRes.data.schedule) {
            const scheduleData = ttRes.data.schedule;
            
            if (scheduleData.length > 0 && Array.isArray(scheduleData[0])) {
              // 2D Array from Admin
              const dayIndex = todayName === 'Sunday' || todayName === 'Saturday' ? 0 : dayNames.indexOf(todayName) - 1; 
              const todayScheduleArray = scheduleData[dayIndex] || [];
              
              todayScheduleArray.forEach((subject, idx) => {
                if (subject && subject !== 'Lunch') {
                  todayClasses.push({
                    dept: targetDept,
                    day: todayName,
                    period: idx + 1,
                    subject: subject,
                    faculty: 'Assigned Faculty',
                    classroom: 'Main Block'
                  });
                }
              });
            } else {
              // Object Array from HOD
              todayClasses = scheduleData.filter(s => 
                s.day.toLowerCase() === todayName.toLowerCase()
              ).sort((a, b) => Number(a.period) - Number(b.period));
            }
          }
          
          if (todayClasses.length === 0 && todayName !== 'Sunday' && todayName !== 'Saturday') {
            const fallbackSubjects = DEPT_SUBJECTS[targetDept] || DEPT_SUBJECTS['Information Technology'] || ['Core Subject 1', 'Core Subject 2'];
            todayClasses = [
              { dept: targetDept, day: todayName, period: 1, subject: fallbackSubjects[0 % fallbackSubjects.length], faculty: 'Assigned Faculty', classroom: 'Main Block LH-1' },
              { dept: targetDept, day: todayName, period: 2, subject: fallbackSubjects[1 % fallbackSubjects.length], faculty: 'Assigned Faculty', classroom: 'Main Block LH-1' },
              { dept: targetDept, day: todayName, period: 3, subject: fallbackSubjects[2 % fallbackSubjects.length], faculty: 'Assigned Faculty', classroom: 'Main Block LH-2' }
            ];
          }
          setTodaySchedule(todayClasses);
        } catch (err) {
          console.error('Failed to fetch timetable for dashboard', err);
          setTodaySchedule([]);
        }

        const marksData = marksRes?.data || [];
        let cgpaTrend = [];
        let internal = 0, external = 0;
        if (marksData.length > 0) {
          internal = marksData[0].internalMarks || 0;
          external = marksData[0].semesterMarks || 0;
          
          // Group marks by semester to calculate CGPA per semester for the trend
          const semMap = {};
          marksData.forEach(m => {
            if (!semMap[m.semester]) semMap[m.semester] = [];
            semMap[m.semester].push(m.gpa || 0);
          });
          
          let cumulativeGPA = 0;
          let semCount = 0;
          Object.keys(semMap).sort().forEach(sem => {
            const semGPAs = semMap[sem];
            const semAvg = semGPAs.reduce((a, b) => a + b, 0) / semGPAs.length;
            cumulativeGPA += semAvg;
            semCount++;
            cgpaTrend.push(Number((cumulativeGPA / semCount).toFixed(2)));
          });
        } else {
          cgpaTrend = [0];
        }

        setStudentMarks({
          internal, external, trend: cgpaTrend, rawMarks: marksData
        });

        // Determine fee status based on backend
        const feesData = feesRes?.data || [];
        const pendingFee = feesData.find(f => f.status === 'Pending');
        if (pendingFee) {
          setStudentDetails(prev => ({...prev, feeStatus: 'Pending', pendingAmount: pendingFee.amount}));
        } else {
          setStudentDetails(prev => ({...prev, feeStatus: 'Paid', pendingAmount: 0}));
        }

      } catch (err) {
        console.error('Failed to load student dashboard data:', err);
      } finally {
        setAssignmentsCount(0);
        setLoading(false);
      }

      // Check for Scholarships
      try {
        const scholarships = JSON.parse(localStorage.getItem('erp_scholarships') || '[]');
        const safeLower = str => (str || '').toString().trim().toLowerCase();
        
        const myScholarship = scholarships.find(s => {
          const idMatch = safeLower(s.studentId) === safeLower(activeStud.id) || safeLower(s.studentId) === safeLower(activeStud.referenceId);
          const nameMatch = safeLower(s.studentName) === safeLower(activeStud.name);
          return idMatch || nameMatch;
        });

        if (myScholarship && myScholarship.status === 'Active') {
          setScholarship(myScholarship);
        }
      } catch (e) {
        console.error('Failed to parse scholarships', e);
      }
    };
    init();
  }, [navigate]);

  const refreshStudentData = useCallback(async () => {
    const studentId = studentIdRef.current;
    if (!studentId) return;
    try {
      const [marksRes, attendanceRes, feesRes] = await Promise.all([
        getMarksByStudent(studentId).catch(() => null),
        getAttendanceByStudent(studentId).catch(() => null),
        getFeesByStudent(studentId).catch(() => null),
      ]);
      if (attendanceRes?.data && attendanceRes.data.length > 0) {
        const presentDays = attendanceRes.data.filter(r => r.status.toLowerCase() === 'present').length;
        const att = Math.round((presentDays / attendanceRes.data.length) * 100);
        setStudentDetails(prev => prev ? { ...prev, attendance: att } : prev);
      }
      const marksData = marksRes?.data || [];
      if (marksData.length > 0) {
        const semMap = {};
        marksData.forEach(m => {
          if (!semMap[m.semester]) semMap[m.semester] = [];
          semMap[m.semester].push(m.gpa || 0);
        });
        
        let cumulativeGPA = 0;
        let semCount = 0;
        let cgpaTrend = [];
        Object.keys(semMap).sort().forEach(sem => {
          const semAvg = semMap[sem].reduce((a, b) => a + b, 0) / semMap[sem].length;
          cumulativeGPA += semAvg;
          semCount++;
          cgpaTrend.push(Number((cumulativeGPA / semCount).toFixed(2)));
        });

        setStudentMarks({ 
          internal: marksData[0].internalMarks || 0, 
          external: marksData[0].semesterMarks || 0, 
          trend: cgpaTrend,
          rawMarks: marksData
        });
      }
      const feesData = feesRes?.data || [];
      const pendingFee = feesData.find(f => f.status === 'Pending');
      setStudentDetails(prev => prev ? { ...prev, feeStatus: pendingFee ? 'Pending' : 'Paid' } : prev);
    } catch (err) {
      console.warn('Background refresh error:', err.message);
    }
  }, []);

  // Auto-refresh when marks, attendance, or fees data changes
  useRealtimeSync(refreshStudentData, ['marks', 'attendance', 'fees']);

  if (loading || !studentDetails) {
    return (
      <div className="student-loading-container">
        <span className="student-spinner-large"></span>
      </div>
    );
  }

  // Calculate Placement Eligibility
  const isPlacementEligible = (studentDetails.cgpa || 0) >= 7.0 && (studentDetails.arrears || 0) === 0 && (studentDetails.attendance || 0) >= 75;

  // Filter exams for student's department and semester
  const studDept = studentDetails?.department || studentDetails?.dept || studentSession?.department || studentSession?.dept || 'Cyber Security';
  const studSem = studentDetails?.sem || studentDetails?.semester || studentSession?.sem || studentSession?.semester || 'Sem 3';
  
  const myExams = exams.filter(ex => 
    ex.dept?.toLowerCase() === studDept.toLowerCase() &&
    ex.sem?.toLowerCase() === studSem.toLowerCase()
  );

  // Attendance Trend Data (Past 5 weeks)
  const baseAtt = studentDetails?.attendance || 85;
  const attendanceTrendData = [
    { name: 'Week 1', rate: Math.max(70, Math.min(100, baseAtt - 5)) },
    { name: 'Week 2', rate: Math.max(70, Math.min(100, baseAtt - 2)) },
    { name: 'Week 3', rate: Math.max(70, Math.min(100, baseAtt + 1)) },
    { name: 'Week 4', rate: Math.max(70, Math.min(100, baseAtt - 1)) },
    { name: 'Current', rate: baseAtt }
  ];

  // CGPA trend across semesters
  const trendData = studentMarks?.trend || [];
  const cgpaTrendData = trendData.length > 0 ? trendData.map((val, idx) => ({
    name: `Sem ${idx + 1}`,
    CGPA: val
  })) : [{ name: 'Sem 1', CGPA: 0 }];

  // Performance Internals vs Externals (for current/latest semester)
  let performanceData = [];
  if (studentMarks && studentMarks.rawMarks && studentMarks.rawMarks.length > 0) {
    const allMarks = studentMarks.rawMarks;
    // Get the latest semester
    const semesters = [...new Set(allMarks.map(m => m.semester))].sort();
    const latestSem = semesters[semesters.length - 1];
    
    // Filter marks for the latest semester
    performanceData = allMarks.filter(m => m.semester === latestSem).map(m => ({
      subject: m.subject.length > 10 ? m.subject.substring(0, 10) + '...' : m.subject,
      Internals: m.internalMarks || 0,
      Externals: (m.semesterMarks || 0) / 2 // chart says "Half-Externals"
    }));
  }

  return (
    <div className="student-dashboard animate-fade-in">
      {hasOverdueBooks && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-5 rounded-2xl mb-8 flex items-start gap-4 shadow-sm">
          <ShieldAlert size={28} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg mb-1 text-red-700 dark:text-red-300">WARNING: Overdue Library Books</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              You currently have one or more overdue library books. Your accumulated library fine is <strong>₹{overdueFines}</strong>. 
              Please return the books to the Central Library immediately to avoid further penalties.
            </p>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="student-welcome-banner">
        <div className="banner-left">
          <h1>Welcome back, {studentDetails.name}!</h1>
          <p>Here is an overview of your academic stats, schedules, and alerts for {studentDetails.sem}.</p>
        </div>
        <div className="student-badge-number">
          <span>REG NO: <strong>{studentDetails.id}</strong></span>
        </div>
      </div>

      {/* Scholarship Alert Banner */}
      {scholarship && (
        <div style={{ padding: '1rem', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#6366F1', color: 'white', padding: '10px', borderRadius: '50%' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>Congratulations! {scholarship.type} Scholarship Active</h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              You have been awarded a <strong>{scholarship.amount} fee waiver</strong>. Check your <a href="#" onClick={(e) => { e.preventDefault(); navigate('/student/fees'); }} style={{ color: '#6366F1', fontWeight: 600 }}>Fees Portal</a> for the updated active statement.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="student-metrics-grid">
        <div className="glass-card s-metric-card">
          <div className="metric-icon-s teal"><Percent size={22} /></div>
          <div className="s-metric-details">
            <span className="card-title-s">Attendance Rate</span>
            <h2 className="metric-value-s">{studentDetails.attendance}%</h2>
            <div className={`metric-sub-s ${studentDetails.todayStatus === 'Present' ? 'text-success' : studentDetails.todayStatus === 'Absent' ? 'text-danger' : 'text-muted'}`}>
              {studentDetails.todayStatus === 'Present' ? '✓ Present Today' : studentDetails.todayStatus === 'Absent' ? '✗ Absent Today' : '• Today: Not Marked'}
            </div>
          </div>
        </div>

        <div className="glass-card s-metric-card">
          <div className="metric-icon-s blue"><BookOpen size={22} /></div>
          <div className="s-metric-details">
            <span className="card-title-s">Current CGPA</span>
            <h2 className="metric-value-s">{studentDetails.cgpa}</h2>
            <div className="metric-sub-s text-success">Outstanding Academic Record</div>
          </div>
        </div>

        <div className="glass-card s-metric-card">
          <div className="metric-icon-s orange"><AlertCircle size={22} /></div>
          <div className="s-metric-details">
            <span className="card-title-s">Pending Fees</span>
            <h2 className="metric-value-s">
              {studentDetails.feeStatus === 'Pending' ? `₹${(studentDetails.pendingAmount || 45000).toLocaleString()}` : '₹0'}
            </h2>
            <div className={`metric-sub-s ${studentDetails.feeStatus === 'Pending' ? 'text-danger' : 'text-success'}`}>
              {studentDetails.feeStatus === 'Pending' ? '⚠ Due by next week' : '✓ Fees Paid'}
            </div>
          </div>
        </div>

        <div className="glass-card s-metric-card">
          <div className="metric-icon-s purple"><Calendar size={22} /></div>
          <div className="s-metric-details">
            <span className="card-title-s">Upcoming Exams</span>
            <h2 className="metric-value-s">{myExams.length} Exams</h2>
            <div className="metric-sub-s text-muted">
              {myExams.length > 0 ? `Next: ${myExams[0].date}` : 'No active exams'}
            </div>
          </div>
        </div>

        <div className="glass-card s-metric-card">
          <div className="metric-icon-s green"><ClipboardList size={22} /></div>
          <div className="s-metric-details">
            <span className="card-title-s">Assignments Pending</span>
            <h2 className="metric-value-s">{assignmentsCount} Tasks</h2>
            <div className="metric-sub-s text-warning-s">Needs submission</div>
          </div>
        </div>

        <div className="glass-card s-metric-card" style={{ cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => navigate('/student/placement')} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
          <div className={`metric-icon-s ${isPlacementEligible ? 'teal' : 'red'}`}>
            <Briefcase size={22} />
          </div>
          <div className="s-metric-details">
            <span className="card-title-s">Placement Status</span>
            <h2 className="metric-value-s">{isPlacementEligible ? 'Eligible ✅' : 'Not Eligible ❌'}</h2>
            <div className={`metric-sub-s ${isPlacementEligible ? 'text-success' : 'text-danger'}`}>
              {isPlacementEligible ? 'Eligible Drives: 12' : 'Action Required'}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid-student">
        {/* Attendance Trend Chart */}
        <div className="glass-card chart-card-s">
          <h3>Attendance Rate Trend</h3>
          <p className="text-muted text-sm">Monthly progression graph</p>
          <div className="chart-container-s">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                <Area type="monotone" dataKey="rate" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#attendanceColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CGPA progression */}
        <div className="glass-card chart-card-s">
          <h3>Semester-wise CGPA</h3>
          <p className="text-muted text-sm">Academic score timeline</p>
          <div className="chart-container-s">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cgpaTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                <Bar dataKey="CGPA" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Internals vs Externals */}
        <div className="glass-card chart-card-s col-span-full-s">
          <h3>Performance Analytics (Internals vs Half-Externals)</h3>
          <p className="text-muted text-sm">Distribution comparison across registered courses</p>
          <div className="chart-container-s">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="subject" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="Internals" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Externals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Announcements & Timetables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        {/* Today's Class Schedule Panel */}
        <div className="glass-card announcements-card-student" style={{ marginTop: 0, gridColumn: '1 / -1' }}>
          <div className="announcements-header">
            <div>
              <h3><Clock size={18} className="text-primary-s" style={{ display: 'inline', marginRight: '6px' }} /> Today's Class Schedule</h3>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} • {studentDetails.dept} • {studentDetails.sem}
              </p>
            </div>
            <span className="notif-pill" style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6' }}>{todaySchedule.length} CLASSES</span>
          </div>
          <div className="announcement-list" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {todaySchedule.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem', gridColumn: '1 / -1' }}>No classes scheduled for today. Enjoy your day off!</p>
            ) : (
              todaySchedule.map((slot, i) => (
                <div key={i} className="announcement-item" style={{ borderLeft: '4px solid #14b8a6', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h4 className="ann-title" style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0 }}>{slot.subject}</h4>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>{getSubjectCode(slot.subject)}</span>
                  </div>
                  <div className="ann-desc" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} style={{ color: 'var(--text-main)' }} /> <strong>{slot.faculty}</strong></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={14} /> {PERIOD_TIMES[slot.period] || `Period ${slot.period}`}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> {slot.classroom || 'Main Block LH-1'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements Panel */}
        <div className="glass-card announcements-card-student" style={{ marginTop: 0 }}>
          <div className="announcements-header">
            <h3><Bell size={18} className="text-primary-s" /> Campus Alerts & Board</h3>
            {notifications.length > 0 && <span className="notif-pill">{notifications.filter(n => !n.isRead).length} NEW</span>}
          </div>
          <div className="announcement-list">
            {notifications.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem' }}>No announcements available.</p>
            ) : (
              notifications.map((n, i) => (
                <div key={n._id || i} className="announcement-item" style={{ borderLeft: `4px solid ${n.type === 'Warning' ? '#ef4444' : n.type === 'Success' ? '#10b981' : '#f59e0b'}`, padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 className="ann-title" style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>{n.title}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="ann-desc" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Exams Timetable Card */}
        <div className="glass-card announcements-card-student" style={{ marginTop: 0 }}>
          <div className="announcements-header">
            <h3><Calendar size={18} style={{ color: '#6366F1' }} /> Scheduled Examinations</h3>
            <span className="notif-pill" style={{ background: 'rgba(99, 102, 241,0.1)', color: '#6366F1' }}>
              {myExams.length} ACTIVE
            </span>
          </div>
          <div className="announcement-list" style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {myExams.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem' }}>No exams scheduled for your semester.</p>
            ) : (
              myExams.map((ex, i) => (
                <div key={ex._id || ex.id || i} className="announcement-item" style={{ borderLeft: '3px solid #6366F1', paddingLeft: '0.75rem' }}>
                  <span className="ann-date" style={{ color: '#6366F1', fontWeight: 700 }}>{ex.name} ({ex.sem || 'Sem 3'})</span>
                  <h4 className="ann-title" style={{ fontSize: '0.9rem', marginTop: '2px' }}>{ex.subject}</h4>
                  <p className="ann-desc" style={{ fontSize: '0.78rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                    ⏱ Time: <strong>{ex.time}</strong> <br />
                    📅 Date: <strong>{ex.date}</strong> · 📍 Hall: <strong>{ex.room || ex.hall || 'Main Hall'}</strong>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
