import React, { useEffect, useState, useCallback } from 'react';
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
import useRealtimeSync from '../../hooks/useRealtimeSync';
import './HodDashboard.css';
import CollegeInfoCard from '../../components/common/CollegeInfoCard';

// Default Fallback
const DEFAULT_SESSION = {
  name: 'Prof. Rajan Iyer',
  dept: 'Computer Science',
  deptCode: 'CSE',
  role: 'HOD'
};

const DEPT_CODE_MAP = {
  'Computer Science Engineering': 'CSE',
  'Information Technology': 'IT',
  'Electronics & Communication Engineering': 'ECE',
  'Electrical & Electronics Engineering': 'EEE',
  'Mechanical Engineering': 'MECH',
  'Civil Engineering': 'CIVIL',
  'Artificial Intelligence & Data Science': 'AIDS',
  'Artificial Intelligence & Machine Learning': 'AIML',
  'Cyber Security': 'CYBER',
  'Biomedical Engineering': 'BME',
  'Aeronautical Engineering': 'AERO',
  'Automobile Engineering': 'AUTO',
  'Robotics Engineering': 'ROBOTICS',
  'Chemical Engineering': 'CHEM',
  'Biotechnology Engineering': 'BIOTECH',
  'Computer Science': 'CSE',
  'Electronics & Comm.': 'ECE',
  'Electrical Engg.': 'EE',
  'Mechanical Engg.': 'MECH',
  'Bachelor of Computer App.': 'BCA',
  'Master of Business Admin.': 'MBA'
};

const DEPARTMENT_METRICS = {
  CSE: {
    students: 0, staff: 0, subjects: 0, attendance: 0,
    lowAttendance: 0, pendingLeaves: 0, upcomingExams: 0, performance: 0
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
  const [notifications, setNotifications] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);

  const fetchLiveData = useCallback(async () => {
    try {
      const { getNotifications, getAllAttendance } = await import('../../api/index');
      const [studRes, staffRes, notifRes, attRes] = await Promise.all([
        getStudents().catch(() => null),
        getStaff().catch(() => null),
        getNotifications().catch(() => ({ data: [] })),
        getAllAttendance().catch(() => ({ data: [] }))
      ]);
      if (studRes?.data) setStudents(studRes.data);
      else {
        const studRaw = localStorage.getItem(`erp_students_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`);
        if (studRaw) setStudents(JSON.parse(studRaw));
      }
      if (staffRes?.data) setStaff(staffRes.data);
      else {
        const staffRaw = localStorage.getItem('erp_staff');
        if (staffRaw) setStaff(JSON.parse(staffRaw));
      }
      if (notifRes?.data) setNotifications(notifRes.data);
      if (attRes?.data) setAllAttendance(attRes.data);
    } catch (err) {
      console.warn('Dashboard API load failed:', err.message);
    }
  }, []);

  useEffect(() => {
    // 1. Session check
    const session = sessionStorage.getItem('hod_session');
    if (session) {
      setHodSession(JSON.parse(session));
    } else {
      navigate('/login');
      return;
    }
    fetchLiveData();
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, [navigate, fetchLiveData]);

  // Auto-refresh when students or staff data changes
  useRealtimeSync(fetchLiveData, ['students', 'staff']);

  const HOD_DEPT = hodSession.dept;
  const deptCode = DEPT_CODE_MAP[HOD_DEPT] || hodSession.deptCode || 'CSE';

  // Connecting Department Specific Data Scopes
  const myStudents = students.filter(s => s.dept === HOD_DEPT || s.department === HOD_DEPT || s.deptCode === deptCode);
  const myStaff = staff.filter(s => s.dept === HOD_DEPT || s.department === HOD_DEPT || s.deptCode === deptCode);

  // Load scoping metric defaults
  const metrics = DEPARTMENT_METRICS[deptCode] || DEPARTMENT_METRICS.CSE;

  // Derive advanced card values
  const totalStudents = myStudents.length;
  const totalStaff = myStaff.length;
  const activeSubjects = 0;
  
  // Calculate today's present count from real attendance records
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const presentCountToday = allAttendance.filter(r => {
    const rDate = new Date(r.date);
    rDate.setUTCHours(0, 0, 0, 0);
    return rDate.getTime() === today.getTime() && 
           (r.department === HOD_DEPT || r.department === deptCode || myStudents.some(s => s.id === r.studentId || s._id === r.studentId)) &&
           r.status === 'Present';
  }).length;

  const lowAttendanceCount = myStudents.filter(s => parseFloat(s.attendance) < 80).length;
  const pendingStaffLeaves = 0;
  const upcomingExams = 0;
  const departmentPerformance = 0;

  // Deriving toppers
  const toppers = [...myStudents]
    .sort((a, b) => (Number(b.cgpa) || 0) - (Number(a.cgpa) || 0))
    .slice(0, 3);

  // Fallback toppers if none exist
  const getToppers = () => {
    return toppers;
  };

  const getLowAttendanceStudents = () => {
    return myStudents.filter(s => parseFloat(s.attendance) < 80);
  };

  // Recharts visual datasets
  const attendanceWeek = [
    { day: 'Mon', att: 92 },
    { day: 'Tue', att: 89 },
    { day: 'Wed', att: 95 },
    { day: 'Thu', att: 91 },
    { day: 'Fri', att: 96 },
    { day: 'Sat', att: 85 }
  ];
  
  const cgpaTrend = [
    { sem: 'Sem 1', avg: 7.8 },
    { sem: 'Sem 2', avg: 8.0 },
    { sem: 'Sem 3', avg: 7.9 },
    { sem: 'Sem 4', avg: 8.2 },
    { sem: 'Sem 5', avg: 8.5 },
    { sem: 'Sem 6', avg: 8.3 }
  ];

  const performanceKPIs = [
    { name: 'Academics', value: 85 },
    { name: 'Research', value: 65 },
    { name: 'Placements', value: 78 },
    { name: 'Activities', value: 90 }
  ];

  const getCgpaColor = (c) => c >= 9 ? 'var(--success)' : c < 7.5 ? 'var(--danger)' : 'var(--warning)';

  return (
    <div className={`hod-dashboard ${animate ? 'animate-fade-in' : ''}`}>
      {/* Welcome Banner */}
      <div className="hod-welcome-banner">
        <div className="hod-welcome-text">

          <h1>Welcome, <span className="gradient-text-purple">{deptCode} HOD Dashboard</span></h1>
          <p className="hod-welcome-sub">Managing and scoping data for the <strong>{HOD_DEPT}</strong> department.</p>
        </div>
      </div>

      {/* 8 Advanced Metrics Cards */}
      <div className="hod-stats-grid grid-8-cards">
        {[
          { label: 'Total Students', value: totalStudents, sub: 'Active enrollment', icon: <Users size={20} />, color: 'purple' },
          { label: 'Total Staff', value: totalStaff, sub: 'Department faculty', icon: <GraduationCap size={20} />, color: 'indigo' },
          { label: 'Active Subjects', value: activeSubjects, sub: 'Courses mapped', icon: <BookOpen size={20} />, color: 'green' },
          { label: 'Present Today', value: presentCountToday, sub: 'Students marked present', icon: <CalendarCheck size={20} />, color: 'teal' },
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
              {notifications.length === 0 ? (
                <li style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent activities found</li>
              ) : (
                notifications.map((n, i) => (
                  <li key={n._id || i} style={{ borderLeft: `3px solid ${n.type === 'Warning' ? '#ef4444' : n.type === 'Success' ? '#10b981' : '#f59e0b'}`, paddingLeft: '0.75rem', marginBottom: '0.5rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{n.message}</p>
                  </li>
                ))
              )}
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
                <p className="text-muted text-sm">No staff found for this department.</p>
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
