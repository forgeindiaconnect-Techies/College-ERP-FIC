import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useRealtimeSync from '../hooks/useRealtimeSync';
import { 
  Users, 
  GraduationCap, 
  Wallet, 
  Building2,
  TrendingUp,
  UserPlus,
  FileText,
  Settings,
  Briefcase,
  BookOpen,
  Calendar,
  CalendarCheck,
  Megaphone,
  ShieldCheck,
  Clock,
  Activity,
  Heart,
  Inbox,
  Crown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { getStudents, getStaff, getDepartments, getAllFees, getAllAttendance, getExams } from '../api/index';
import './Dashboard.css';

const MOCK_ATTENDANCE = [
  { name: 'Mon', students: 95, staff: 98 },
  { name: 'Tue', students: 92, staff: 97 },
  { name: 'Wed', students: 96, staff: 99 },
  { name: 'Thu', students: 89, staff: 95 },
  { name: 'Fri', students: 98, staff: 100 },
  { name: 'Sat', students: 85, staff: 90 },
];

const MOCK_DEPT_SCORES = [
  { name: 'CSE', score: 92, staff: 94 },
  { name: 'ECE', score: 85, staff: 91 },
  { name: 'MECH', score: 78, staff: 86 },
  { name: 'EEE', score: 80, staff: 89 },
  { name: 'BCA', score: 88, staff: 92 },
  { name: 'MBA', score: 94, staff: 96 }
];

const MOCK_CGPA = [
  { semester: 'Sem 1', avg: 7.8, top: 9.5 },
  { semester: 'Sem 2', avg: 8.1, top: 9.6 },
  { semester: 'Sem 3', avg: 7.9, top: 9.4 },
  { semester: 'Sem 4', avg: 8.3, top: 9.8 },
  { semester: 'Sem 5', avg: 8.5, top: 9.9 },
  { semester: 'Sem 6', avg: 8.4, top: 9.7 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [depts, setDepts] = useState([]);
  const [hods, setHods] = useState([]);
  const [fees, setFees] = useState([]);
  const [exams, setExams] = useState([]);
  const [leavesCount, setLeavesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, staffRes, deptsRes, feesRes, examsRes] = await Promise.all([
        getStudents().catch(() => ({ data: [] })),
        getStaff().catch(() => ({ data: [] })),
        getDepartments().catch(() => ({ data: [] })),
        getAllFees().catch(() => ({ data: [] })),
        getExams().catch(() => ({ data: [] }))
      ]);

      const sData = studentsRes?.data || [];
      const fData = staffRes?.data || [];
      const dData = deptsRes?.data || [];
      const feesData = feesRes?.data || [];
      const examsData = examsRes?.data || [];

      setStudents(sData);
      setStaff(fData);
      setDepts(dData);
      setFees(feesData);
      setExams(examsData);

      const hodsList = fData.filter(s => s.designation === 'HOD' || s.role === 'HOD' || s.email?.includes('hod'));
      setHods(hodsList.length > 0 ? hodsList : dData.filter(d => d.hod));

      const savedLeaves = localStorage.getItem('erp_leave_requests');
      if (savedLeaves) {
        const lData = JSON.parse(savedLeaves);
        setLeavesCount(lData.filter(l => l.status === 'Pending').length);
      } else {
        setLeavesCount(1);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time sync: re-fetch when Accounts / any module emits dataUpdated
  useRealtimeSync(fetchAllData, ['fees', 'salaries', 'students', 'staff', 'expenses']);

  useEffect(() => {
    const session = sessionStorage.getItem('admin_session');
    if (!session) { navigate('/login'); return; }
    fetchAllData();
  }, [navigate, fetchAllData]);

  // Aggregate Metrics Calculations
  const totalStudentsCount = students.length;
  const totalStaffCount = staff.length;
  const totalDeptsCount = depts.length;
  const totalHodsCount = hods.length;
  const totalParentsCount = students.length;
  // Dynamic Subjects: Calculate based on unique subjects taught by staff or approximate by department
  const uniqueSubjects = new Set(staff.flatMap(s => s.subjects || []));
  const totalSubjectsCount = uniqueSubjects.size > 0 ? uniqueSubjects.size : depts.length * 5; 
  const leaveRequestsCount = leavesCount;
  const activeExamsCount = exams.length;

  // Calculate dynamic fees collected
  const totalFeesCollected = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  
  const feesDisplay = totalFeesCollected >= 100000 
    ? `₹${(totalFeesCollected / 100000).toFixed(1)}L`
    : `₹${totalFeesCollected.toLocaleString()}`;

  // Calculate dynamic average attendance
  const averageAttendance = students.length > 0
    ? (students.reduce((sum, s) => sum + (s.attendance || 0), 0) / students.length).toFixed(1)
    : '0';

  // Calculate dynamic department scores for chart
  const deptScores = depts.length > 0 ? depts.map(d => {
    const deptStudents = students.filter(s => s.dept === d.name);
    const avgScore = deptStudents.length > 0 
      ? (deptStudents.reduce((sum, s) => sum + (s.cgpa || 0), 0) / deptStudents.length) * 10
      : 0;
    const deptStaff = staff.filter(s => s.dept === d.name);
    const totalLoad = deptStaff.reduce((sum, s) => sum + (s.workload || 0), 0);
    return {
      name: d.code || d.name.slice(0, 4).toUpperCase(),
      score: parseFloat(avgScore.toFixed(1)),
      staff: totalLoad || 0
    };
  }) : [];

  const attendanceData = [
    { name: 'Week 1', students: 85, staff: 95 },
    { name: 'Week 2', students: 82, staff: 94 },
    { name: 'Week 3', students: 88, staff: 96 },
    { name: 'Week 4', students: 84, staff: 92 },
    { name: 'Week 5', students: parseFloat(averageAttendance) || 86, staff: 93 }
  ];

  const cgpaData = [
    { semester: 'Sem 1', avg: 7.2, top: 9.1 },
    { semester: 'Sem 2', avg: 7.5, top: 9.4 },
    { semester: 'Sem 3', avg: 7.8, top: 9.5 },
    { semester: 'Sem 4', avg: 7.6, top: 9.3 },
    { semester: 'Sem 5', avg: 7.9, top: 9.6 }
  ];

  const sessionStr = sessionStorage.getItem('admin_session');
  let sessionData = null;
  let remainingHours = 0;
  let isTrial = false;
  let isActivePlan = false;
  let activePlanName = '';
  let daysToRenew = 0;

  try {
    if (sessionStr) {
      sessionData = JSON.parse(sessionStr);
      if (sessionData.subscription && sessionData.subscription.plan === 'Trial') {
        isTrial = true;
        const endDate = new Date(sessionData.subscription.trialEndDate);
        const diffMs = endDate - new Date();
        remainingHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      } else if (sessionData.subscription && sessionData.subscription.status === 'Active') {
        isActivePlan = true;
        activePlanName = sessionData.subscription.plan;
        const endDate = new Date(sessionData.subscription.trialEndDate);
        const diffMs = endDate - new Date();
        daysToRenew = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }
    }
  } catch (e) {
    console.error('Error parsing admin session', e);
  }

  return (
    <div className="dashboard animate-fade-in">
      {isTrial && (
        <div style={{
          background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(239,68,68,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
            <Activity size={20} />
            <span>Trial Version</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>
            Your free trial will expire in {remainingHours} hours. Trial limits: 1 HOD, 2 Students.
          </div>
          <button 
            onClick={() => navigate('/upgrade-plan')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s'
            }}>
            Upgrade Plan
          </button>
        </div>
      )}

      {!isTrial && isActivePlan && (
        <div style={{
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
            <Crown size={20} />
            <span>{activePlanName} Plan Active</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>
            {daysToRenew <= 7 
              ? `Your subscription expires in ${daysToRenew} days. Please renew soon!`
              : `Your subscription is active for ${daysToRenew} more days.`}
          </div>
          {daysToRenew <= 7 && (
            <button 
              onClick={() => navigate('/upgrade-plan')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'all 0.2s'
              }}>
              Renew Plan
            </button>
          )}
        </div>
      )}

      {/* Dashboard Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1>College Admin Console</h1>
          <p className="text-muted">Manage your institution, departments, and users.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 2px rgba(16,185,129,0.3)', animation: 'pulse 2s infinite' }} />
            Live Sync
          </div>
          <button className="btn-primary" onClick={() => navigate('/admin/reports')}>
            <FileText size={18} />
            System Reports
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-blue">
            <Users size={18} />
          </div>
          <div className="stat-details">
            <h3>Total Students</h3>
            <p className="stat-value">{totalStudentsCount.toLocaleString()}</p>
            <p className="stat-change positive">
              <TrendingUp size={12} /> Global Enrollment
            </p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-purple">
            <GraduationCap size={18} />
          </div>
          <div className="stat-details">
            <h3>Total HODs</h3>
            <p className="stat-value">{totalHodsCount}</p>
            <p className="stat-change positive">
              <TrendingUp size={12} /> Assigned departments
            </p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-orange">
            <Building2 size={18} />
          </div>
          <div className="stat-details">
            <h3>Departments</h3>
            <p className="stat-value">{totalDeptsCount}</p>
            <p className="stat-change text-muted">Active divisions</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-green">
            <CalendarCheck size={18} />
          </div>
          <div className="stat-details">
            <h3>Avg Attendance</h3>
            <p className="stat-value">{averageAttendance}%</p>
            <p className="stat-change positive">
              <TrendingUp size={12} /> Overall rate
            </p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-emerald">
            <Wallet size={18} />
          </div>
          <div className="stat-details">
            <h3>Fees Collected</h3>
            <p className="stat-value">{feesDisplay}</p>
            <p className="stat-change positive">
              <TrendingUp size={12} /> Mapped terms
            </p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-teal">
            <Heart size={18} />
          </div>
          <div className="stat-details">
            <h3>Parents Accounts</h3>
            <p className="stat-value">{totalParentsCount.toLocaleString()}</p>
            <p className="stat-change positive">
              <TrendingUp size={12} /> Active links
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="dashboard-grid">
        <div className="chart-card glass-card col-span-2">
          <div className="card-header">
            <h3>Global Attendance Trends</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', boxShadow: 'var(--shadow-md)' }} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="students" name="Students Attendance" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                <Area type="monotone" dataKey="staff" name="Staff Attendance" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorStaff)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="card-header">
            <h3>Departmental Grades & KPI</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip cursor={{fill: 'var(--border-color)'}} contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', boxShadow: 'var(--shadow-md)' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="score" name="Avg Score" fill="url(#colorBar)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="staff" name="Faculty Load" fill="#10b981" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-card col-span-2">
          <div className="card-header">
            <h3>College CGPA Academic Curve</h3>
          </div>
          <div className="chart-container" style={{ minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cgpaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="semester" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[5, 10]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', boxShadow: 'var(--shadow-md)' }} />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="avg" name="Average CGPA" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="top" name="Top CGPA" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-card">
          <div className="card-header mb-4 px-6 pt-6">
            <h3>Super Admin Quick Actions</h3>
          </div>
          <div className="quick-actions-grid p-6">
            <button className="quick-action-btn" onClick={() => navigate('/admin/hods')}>
              <div className="action-icon bg-icon-purple"><UserPlus size={20} /></div>
              <span>Register HOD</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/admin/staff')}>
              <div className="action-icon bg-icon-violet"><GraduationCap size={20} /></div>
              <span>Register Staff</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/admin/announcements')}>
              <div className="action-icon bg-icon-amber"><Megaphone size={20} /></div>
              <span>Publish News</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/admin/settings')}>
              <div className="action-icon bg-icon-skyblue"><Settings size={20} /></div>
              <span>Manage Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scoped Details Rows */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>📋 Recent Global Operations Logs</h3>
          <div style={{ marginTop: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                { time: '5 mins ago', user: 'Admin', act: 'Registered new HOD account (Dr. Sanjay Sen).' },
                { time: '1 hour ago', user: 'CSE HOD', act: 'Added active Student Roll No: CSE007.' },
                { time: 'Today', user: 'ECE HOD', act: 'Modified semester 3 timetable period schedule.' },
                { time: 'Yesterday', user: 'System', act: 'Automated database check and seeder successfully run.' }
              ].map((log, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                  <span className="text-muted" style={{ fontWeight: 600, minWidth: '75px' }}>{log.time}</span>
                  <span className="badge-outline" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', border: '1px solid var(--primary)', borderRadius: '4px', color: 'var(--primary)' }}>{log.user}</span>
                  <span style={{ color: 'var(--text-main)', flex: 1 }}>{log.act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>🚀 Secondary System Modules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            {[
              { title: 'Subjects', val: totalSubjectsCount, path: '/admin/subjects', icon: <BookOpen size={16} /> },
              { title: 'Timetables', val: 'Active', path: '/admin/timetable', icon: <Calendar size={16} /> },
              { title: 'Exams', val: activeExamsCount, path: '/admin/exams', icon: <FileText size={16} /> },
              { title: 'Leave Requests', val: leaveRequestsCount, path: '/admin/leaves', icon: <Inbox size={16} /> }
            ].map((mod, i) => (
              <div 
                key={i} 
                onClick={() => navigate(mod.path)} 
                style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--bg-primary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'var(--transition)'
                }}
                className="hover-card-anim"
              >
                <div style={{ color: 'var(--primary)' }}>{mod.icon}</div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mod.title}</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{mod.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
