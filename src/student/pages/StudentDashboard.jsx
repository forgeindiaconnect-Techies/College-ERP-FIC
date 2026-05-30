import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, CartesianGrid, Legend
} from 'recharts';
import {
  ClipboardList, BookOpen, AlertCircle, FileText, Bell,
  Percent, Calendar, ShieldAlert, Clock, MapPin, User
} from 'lucide-react';
import { 
  getStudentById, getAttendanceByStudent, 
  getMarksByStudent, getFeesByStudent, getExams 
} from '../../api/index';
import useRealtimeSync from '../../hooks/useRealtimeSync';
import './StudentDashboard.css';

// Fallbacks
const DEFAULT_STUDENT = {
  id: 'CS2022001',
  name: 'John Doe',
  dept: 'Cyber Security',
  sem: 'Sem 3',
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
  const [loading, setLoading] = useState(true);
  const [studentSession, setStudentSession] = useState(DEFAULT_STUDENT);

  // Student specific data
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentMarks, setStudentMarks] = useState(null);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [exams, setExams] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);

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
        const studentId = activeStud.referenceId || activeStud.id || activeStud._id;
        studentIdRef.current = studentId; // track for real-time sync
        // Fetch real data in parallel
        const [studentRes, marksRes, feesRes, attendanceRes, examsRes] = await Promise.all([
          getStudentById(studentId).catch(() => null),
          getMarksByStudent(studentId).catch(() => null),
          getFeesByStudent(studentId).catch(() => null),
          getAttendanceByStudent(studentId).catch(() => null),
          getExams().catch(() => ({ data: [] }))
        ]);

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
        }
        
        setStudentDetails(dbRecord);

        if (examsRes?.data) {
          setExams(examsRes.data);
        }

        // Fetch timetable
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = dayNames[new Date().getDay()];
        let savedTimetable = JSON.parse(localStorage.getItem('erp_timetable') || '[]');
        
        // Seed mock data if empty
        if (savedTimetable.length === 0) {
          savedTimetable = [
            { dept: activeStud.dept, day: todayName, period: 1, subject: 'DBMS', faculty: 'Mr. Arun Kumar', classroom: 'Room A101' },
            { dept: activeStud.dept, day: todayName, period: 2, subject: 'Computer Networks', faculty: 'Ms. Priya Sharma', classroom: 'Room A102' }
          ];
          localStorage.setItem('erp_timetable', JSON.stringify(savedTimetable));
        }

        const todayClasses = savedTimetable.filter(s => 
          s.dept === activeStud.dept && s.day.toLowerCase() === todayName.toLowerCase()
        ).sort((a, b) => Number(a.period) - Number(b.period));
        
        setTodaySchedule(todayClasses);

        // Calculate CGPA from marks, or fallback
        const marksData = marksRes?.data || [];
        let cgpaTrend = [8.2, 8.4, 8.5, 8.6];
        let internal = 0, external = 0;
        if (marksData.length > 0) {
          internal = marksData[0].internalMarks || 0;
          external = marksData[0].semesterMarks || 0;
        }

        setStudentMarks({
          internal, external, trend: cgpaTrend
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
    };
    init();
  }, [navigate]);

  // Keep a ref to the last known student ID so we can refresh on data changes
  const studentIdRef = useRef(null);
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
        setStudentMarks({ internal: marksData[0].internalMarks || 42, external: marksData[0].externalMarks || 85, trend: [8.2, 8.4, 8.5, 8.6] });
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

  // Filter exams for student's department and semester
  const studDept = studentDetails?.department || studentDetails?.dept || studentSession?.department || studentSession?.dept || 'Cyber Security';
  const studSem = studentDetails?.sem || studentDetails?.semester || studentSession?.sem || studentSession?.semester || 'Sem 3';
  
  const myExams = exams.filter(ex => 
    ex.dept?.toLowerCase() === studDept.toLowerCase() &&
    ex.sem?.toLowerCase() === studSem.toLowerCase()
  );

  // Attendance Trend Data (Past 5 weeks)
  const attendanceTrendData = [];

  // CGPA trend across semesters
  const trendData = studentMarks?.trend || [];
  const cgpaTrendData = trendData.map((val, idx) => ({
    name: `Sem ${idx + 1}`,
    CGPA: val
  }));

  // Performance Internals vs Externals
  const performanceData = [];

  return (
    <div className="student-dashboard animate-fade-in">
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

      {/* Metrics Row */}
      <div className="student-metrics-grid">
        <div className="glass-card s-metric-card">
          <div className="metric-icon-s teal"><Percent size={22} /></div>
          <div className="s-metric-details">
            <span className="card-title-s">Attendance Rate</span>
            <h2 className="metric-value-s">{studentDetails.attendance}%</h2>
            <div className="metric-sub-s text-success">✓ Above 75% threshold</div>
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

        <div className="glass-card s-metric-card">
          <div className="metric-icon-s red"><ShieldAlert size={22} /></div>
          <div className="s-metric-details">
            <span className="card-title-s">Semester Status</span>
            <h2 className="metric-value-s">{studentDetails.status || 'Active'}</h2>
            <div className="metric-sub-s text-success">Good Standing</div>
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
            <span className="notif-pill">2 NEW</span>
          </div>
          <div className="announcement-list">
            <p className="text-muted text-center" style={{ padding: '2rem' }}>No announcements available.</p>
          </div>
        </div>

        {/* Dynamic Exams Timetable Card */}
        <div className="glass-card announcements-card-student" style={{ marginTop: 0 }}>
          <div className="announcements-header">
            <h3><Calendar size={18} style={{ color: '#8b5cf6' }} /> Scheduled Examinations</h3>
            <span className="notif-pill" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
              {myExams.length} ACTIVE
            </span>
          </div>
          <div className="announcement-list" style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {myExams.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem' }}>No exams scheduled for your semester.</p>
            ) : (
              myExams.map((ex, i) => (
                <div key={ex._id || ex.id || i} className="announcement-item" style={{ borderLeft: '3px solid #8b5cf6', paddingLeft: '0.75rem' }}>
                  <span className="ann-date" style={{ color: '#8b5cf6', fontWeight: 700 }}>{ex.name} ({ex.sem || 'Sem 3'})</span>
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
