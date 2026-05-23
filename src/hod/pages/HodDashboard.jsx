import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, CalendarCheck, TrendingUp, BookOpenCheck,
  AlertTriangle, ArrowRight, Trophy, Activity, Briefcase, Clock,
  Calendar, MapPin, User, ChevronRight, BookOpen, Inbox, FileText, ClipboardList, Megaphone, CheckCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getStudents, getStaff } from '../../api/index';
import './HodDashboard.css';

// Default Fallback
const DEFAULT_SESSION = {
  name: 'Prof. Rajan Iyer',
  dept: 'Computer Science',
  deptCode: 'CSE',
  role: 'HOD'
};

const DEPT_CODE_MAP = {
  'Computer Science': 'CSE',
  'Electronics & Comm.': 'ECE',
  'Electrical & Electronics': 'EEE',
  'Mechanical Engg.': 'MECH',
  'Bachelor of Computer App.': 'BCA',
  'Master of Business Admin.': 'MBA'
};

const DEPARTMENT_METRICS = {
  CSE: {
    students: 120, staff: 15, subjects: 8, attendance: 92,
    lowAttendance: 4, pendingLeaves: 2, upcomingExams: 3, performance: 88
  },
  ECE: {
    students: 95, staff: 12, subjects: 7, attendance: 91,
    lowAttendance: 3, pendingLeaves: 1, upcomingExams: 2, performance: 86
  },
  MECH: {
    students: 110, staff: 14, subjects: 9, attendance: 85,
    lowAttendance: 6, pendingLeaves: 3, upcomingExams: 4, performance: 82
  },
  EEE: {
    students: 80, staff: 10, subjects: 6, attendance: 90,
    lowAttendance: 2, pendingLeaves: 0, upcomingExams: 2, performance: 84
  },
  BCA: {
    students: 140, staff: 11, subjects: 8, attendance: 93,
    lowAttendance: 5, pendingLeaves: 1, upcomingExams: 3, performance: 89
  },
  MBA: {
    students: 90, staff: 13, subjects: 10, attendance: 96,
    lowAttendance: 1, pendingLeaves: 2, upcomingExams: 2, performance: 91
  }
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const AVATAR_COLORS = ['bg-gradient-blue', 'bg-gradient-purple', 'bg-gradient-orange', 'bg-gradient-green', 'bg-gradient-teal', 'bg-gradient-pink'];

const HodDashboard = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [hodSession, setHodSession] = useState(DEFAULT_SESSION);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    // 1. Session check
    const session = sessionStorage.getItem('hod_session');
    if (session) {
      setHodSession(JSON.parse(session));
    } else {
      navigate('/login');
      return;
    }

    // 2. Fetch live student + staff data from API
    const fetchLiveData = async () => {
      try {
        const [studRes, staffRes] = await Promise.all([
          getStudents().catch(() => null),
          getStaff().catch(() => null),
        ]);
        if (studRes?.data) setStudents(studRes.data);
        else {
          const studRaw = localStorage.getItem('erp_students');
          if (studRaw) setStudents(JSON.parse(studRaw));
        }
        if (staffRes?.data) setStaff(staffRes.data);
        else {
          const staffRaw = localStorage.getItem('erp_staff');
          if (staffRaw) setStaff(JSON.parse(staffRaw));
        }
      } catch (err) {
        console.warn('Dashboard API load failed:', err.message);
      }
    };
    fetchLiveData();

    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, [navigate]);

  const HOD_DEPT = hodSession.dept;
  const deptCode = DEPT_CODE_MAP[HOD_DEPT] || hodSession.deptCode || 'CSE';

  // Connecting Department Specific Data Scopes
  const myStudents = students.filter(s => s.dept === HOD_DEPT || s.department === HOD_DEPT || s.deptCode === deptCode);
  const myStaff = staff.filter(s => s.dept === HOD_DEPT || s.department === HOD_DEPT || s.deptCode === deptCode);

  // Load scoping metric defaults
  const metrics = DEPARTMENT_METRICS[deptCode] || DEPARTMENT_METRICS.CSE;

  // Derive advanced card values
  const totalStudents = myStudents.length > 0 ? myStudents.length : metrics.students;
  const totalStaff = myStaff.length > 0 ? myStaff.length : metrics.staff;
  const activeSubjects = metrics.subjects;
  const todayAttendance = myStudents.length > 0
    ? Math.round(myStudents.reduce((acc, curr) => acc + (parseFloat(curr.attendance) || 0), 0) / myStudents.length)
    : metrics.attendance;
  const lowAttendanceCount = myStudents.length > 0
    ? myStudents.filter(s => parseFloat(s.attendance) < 80).length
    : metrics.lowAttendance;
  const pendingStaffLeaves = metrics.pendingLeaves;
  const upcomingExams = metrics.upcomingExams;
  const departmentPerformance = metrics.performance;

  // Deriving toppers
  const toppers = [...myStudents]
    .sort((a, b) => (Number(b.cgpa) || 0) - (Number(a.cgpa) || 0))
    .slice(0, 3);

  // Fallback toppers if none exist
  const getToppers = () => {
    if (toppers.length > 0) return toppers;
    return [
      { id: `${deptCode}001`, name: 'Suresh Kumar', sem: 'Sem 5', cgpa: 9.2 },
      { id: `${deptCode}002`, name: 'Divya', sem: 'Sem 3', cgpa: 8.8 },
      { id: `${deptCode}003`, name: 'Arun', sem: 'Sem 1', cgpa: 8.5 }
    ];
  };

  const getLowAttendanceStudents = () => {
    const list = myStudents.filter(s => parseFloat(s.attendance) < 80);
    if (list.length > 0) return list;
    return [
      { id: `${deptCode}005`, name: 'Rahul Sharma', sem: 'Sem 3', attendance: '68%' }
    ];
  };

  // Recharts visual datasets
  const attendanceWeek = [
    { day: 'Mon', pct: Math.min(100, todayAttendance + 2) },
    { day: 'Tue', pct: Math.min(100, todayAttendance + 1) },
    { day: 'Wed', pct: Math.max(0, todayAttendance - 3) },
    { day: 'Thu', pct: Math.min(100, todayAttendance + 3) },
    { day: 'Fri', pct: Math.min(100, todayAttendance - 1) },
    { day: 'Sat', pct: Math.max(0, todayAttendance - 8) },
  ];

  const cgpaTrend = [
    { sem: 'Sem 1', avg: 8.2 },
    { sem: 'Sem 2', avg: 8.3 },
    { sem: 'Sem 3', avg: 8.5 },
    { sem: 'Sem 4', avg: 8.4 },
    { sem: 'Sem 5', avg: 8.7 },
    { sem: 'Sem 6', avg: 8.9 }
  ];

  const performanceKPIs = [
    { name: 'Syllabus Cover %', value: 85 },
    { name: 'Staff Attendance %', value: 95 },
    { name: 'Pass Rate %', value: departmentPerformance },
    { name: 'Research Output %', value: 78 }
  ];

  const getCgpaColor = (c) => c >= 9 ? 'var(--success)' : c < 7.5 ? 'var(--danger)' : 'var(--warning)';

  return (
    <div className={`hod-dashboard ${animate ? 'animate-fade-in' : ''}`}>
      {/* Welcome Banner */}
      <div className="hod-welcome-banner">
        <div className="hod-welcome-text">
          <div className="hod-welcome-tag">
            <Activity size={14} /> Head of Department View Scoped
          </div>
          <h1>Welcome, <span className="gradient-text-purple">{deptCode} HOD Dashboard</span></h1>
          <p className="hod-welcome-sub">Managing and scoping data for the <strong>{HOD_DEPT}</strong> department.</p>
        </div>
        <div className="hod-welcome-actions">
          <button className="hod-btn-primary" onClick={() => navigate('/hod/students')}>
            <Users size={17} /> Scoped Students <ArrowRight size={16} />
          </button>
          <button className="hod-btn-ghost" onClick={() => navigate('/hod/staff')}>
            <GraduationCap size={17} /> Scoped Staff
          </button>
        </div>
      </div>

      {/* 8 Advanced Metrics Cards */}
      <div className="hod-stats-grid grid-8-cards">
        {[
          { label: 'Total Students', value: totalStudents, sub: 'Active enrollment', icon: <Users size={20} />, color: 'purple' },
          { label: 'Total Staff', value: totalStaff, sub: 'Department faculty', icon: <GraduationCap size={20} />, color: 'indigo' },
          { label: 'Active Subjects', value: activeSubjects, sub: 'Courses mapped', icon: <BookOpen size={20} />, color: 'green' },
          { label: 'Today Attendance %', value: `${todayAttendance}%`, sub: 'Standard target ≥90%', icon: <CalendarCheck size={20} />, color: 'teal' },
          { label: 'Low Attendance Students', value: lowAttendanceCount, sub: 'Under 80% mark', icon: <AlertTriangle size={20} />, color: 'amber' },
          { label: 'Pending Staff Leaves', value: pendingStaffLeaves, sub: 'Requires approval', icon: <Inbox size={20} />, color: 'blue' },
          { label: 'Upcoming Exams', value: upcomingExams, sub: 'Scheduled blocks', icon: <FileText size={20} />, color: 'red' },
          { label: 'Department Performance', value: `${departmentPerformance}%`, sub: 'Aggregate score', icon: <TrendingUp size={20} />, color: 'pink' }
        ].map((card, idx) => (
          <div key={idx} className="hod-stat-card">
            <div className={`hod-stat-icon ${card.color}`}>
              {card.icon}
            </div>
            <div className="hod-stat-details">
              <p className="hod-stat-label">{card.label}</p>
              <p className="hod-stat-value">{card.value}</p>
              <p className="hod-stat-sub text-muted">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Department Analytics Charts */}
      <div className="hod-charts-grid">
        <div className="hod-chart-card">
          <h3>Weekly Scoped Attendance (%)</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceWeek}>
                <defs>
                  <linearGradient id="hodAttGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', boxShadow: 'var(--shadow-md)', fontSize: 12 }} />
                <Area type="monotone" dataKey="pct" name="Attendance %" stroke="var(--primary)" strokeWidth={2.5} fill="url(#hodAttGrad)" dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'white' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hod-chart-card">
          <h3>Semester-wise Avg CGPA</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cgpaTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="sem" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[6, 10]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', boxShadow: 'var(--shadow-md)', fontSize: 12 }} />
                <Line type="monotone" dataKey="avg" name="Avg CGPA" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hod-chart-card">
          <h3>Performance Scoping metrics</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceKPIs} barSize={26}>
                <defs>
                  <linearGradient id="hodPerfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', boxShadow: 'var(--shadow-md)', fontSize: 12 }} />
                <Bar dataKey="value" name="Percentage %" fill="url(#hodPerfGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Quick Actions & Dynamic Activities Log Flow */}
      <div className="hod-charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginTop: '0.2rem' }}>
        {/* Quick Actions Card */}
        <div className="hod-chart-card" style={{ paddingBottom: '1.25rem' }}>
          <h3>⚡ Quick Administrative Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '1rem', height: '100%', minHeight: '140px' }}>
            <button className="hod-btn-primary" style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.65rem' }} onClick={() => navigate('/hod/students')}>
              <Users size={15} /> Register Student
            </button>
            <button className="hod-btn-ghost" style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.65rem' }} onClick={() => navigate('/hod/timetable')}>
              <Calendar size={15} /> Manage Timetable
            </button>
            <button className="hod-btn-ghost" style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.65rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }} onClick={() => navigate('/hod/announcements')}>
              <Megaphone size={15} /> Post News
            </button>
            <button className="hod-btn-primary" style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.65rem', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', border: 'none', boxShadow: '0 4px 10px rgba(245,158,11,0.2)' }} onClick={() => navigate('/hod/leaves')}>
              <Inbox size={15} /> Approve Leaves
            </button>
          </div>
        </div>

        {/* Dynamic Activity Log */}
        <div className="hod-chart-card">
          <h3>📋 Recent Scoped Activities</h3>
          <div style={{ marginTop: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { time: '10 mins ago', type: 'Student', text: `New student registration completed for Roll No: ${deptCode}007.` },
                { time: '1 hour ago', type: 'Staff', text: `Prof. Mehra requested emergency medical leave approval.` },
                { time: 'Today', type: 'Timetable', text: `Timetable modified for ${deptCode} 2nd Year Section A.` },
                { time: 'Yesterday', type: 'Exam', text: `Internal exam schedule updated for semester 4.` }
              ].map((act, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.8rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                  <span className="text-muted" style={{ fontWeight: 600, minWidth: '70px' }}>{act.time}</span>
                  <span className="badge-outline" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>{act.type}</span>
                  <span style={{ color: 'var(--text-main)', flex: 1 }}>{act.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Scoped Lists & Dynamic Summaries */}
      <div className="hod-lists-row-grid" style={{ marginTop: '0.5rem' }}>
        {/* Top Performers */}
        <div className="hod-list-card glass-card">
          <div className="hod-list-header">
            <h3><Trophy size={16} style={{ color: 'var(--warning)' }} /> Scoped Top Performers</h3>
            <button className="hod-link-btn" onClick={() => navigate('/hod/marks')}>View Marks <ArrowRight size={14} /></button>
          </div>
          <div className="hod-list-content">
            {getToppers().map((s, idx) => (
              <div key={idx} className="hod-list-item">
                <span className="rank-tag">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                <div className={`avatar-xs ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>{s.name[0]}</div>
                <div className="item-info">
                  <p className="item-title">{s.name}</p>
                  <p className="item-subtitle">{s.sem} · {s.id || s.rollNo}</p>
                </div>
                <span className="item-metric font-semibold" style={{ color: getCgpaColor(s.cgpa) }}>{s.cgpa} CGPA</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Attendance Alert */}
        <div className="hod-list-card glass-card">
          <div className="hod-list-header">
            <h3><AlertTriangle size={16} style={{ color: 'var(--danger)' }} /> Scoped Attendance Alert (&lt; 80%)</h3>
            <button className="hod-link-btn" onClick={() => navigate('/hod/students')}>View All <ArrowRight size={14} /></button>
          </div>
          <div className="hod-list-content">
            {getLowAttendanceStudents().map((s, idx) => (
              <div key={idx} className="hod-list-item">
                <div className="avatar-xs bg-gradient-orange">{s.name[0]}</div>
                <div className="item-info">
                  <p className="item-title">{s.name}</p>
                  <p className="item-subtitle">{s.sem} · {s.id || s.rollNo}</p>
                </div>
                <span className="item-metric text-danger font-semibold">{s.attendance}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Workloads */}
        <div className="hod-list-card glass-card">
          <div className="hod-list-header">
            <h3><GraduationCap size={16} style={{ color: 'var(--primary)' }} /> Scoped Faculty list</h3>
            <button className="hod-link-btn" onClick={() => navigate('/hod/staff')}>View All <ArrowRight size={14} /></button>
          </div>
          <div className="hod-list-content">
            {myStaff.length === 0 ? (
              <div className="hod-list-item">
                <div className="avatar-xs bg-gradient-blue">R</div>
                <div className="item-info">
                  <p className="item-title">Dr. Rajan Iyer</p>
                  <p className="item-subtitle">Senior Professor</p>
                </div>
                <span className="item-metric font-semibold text-success">12 hrs/wk</span>
              </div>
            ) : myStaff.slice(0, 3).map((s, idx) => (
              <div key={idx} className="hod-list-item">
                <div className={`avatar-xs ${AVATAR_COLORS[(idx + 2) % AVATAR_COLORS.length]}`}>{s.name[0]}</div>
                <div className="item-info">
                  <p className="item-title">{s.name}</p>
                  <p className="item-subtitle">{s.designation || 'Lecturer'}</p>
                </div>
                <span className="item-metric font-semibold text-success">{s.workload || '14'} hrs/wk</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
