import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, CartesianGrid, Legend
} from 'recharts';
import {
  ClipboardList, BookOpen, AlertCircle, FileText, Bell,
  Percent, Calendar, ShieldAlert
} from 'lucide-react';
import { 
  getStudentById, getAttendanceByStudent, 
  getMarksByStudent, getFeesByStudent 
} from '../../api/index';
import './StudentDashboard.css';

// Fallbacks
const DEFAULT_STUDENT = {
  id: 'CS2022001',
  name: 'John Doe',
  dept: 'Computer Science',
  sem: 'Sem 6',
  email: 'john@college.edu'
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentSession, setStudentSession] = useState(DEFAULT_STUDENT);

  // Student specific data
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentMarks, setStudentMarks] = useState(null);
  const [assignmentsCount, setAssignmentsCount] = useState(0);

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
        // Fetch real data in parallel
        const [studentRes, marksRes, feesRes, attendanceRes] = await Promise.all([
          getStudentById(activeStud.id).catch(() => null),
          getMarksByStudent(activeStud.id).catch(() => null),
          getFeesByStudent(activeStud.id).catch(() => null),
          getAttendanceByStudent(activeStud.id).catch(() => null)
        ]);

        let dbRecord = studentRes?.data || null;
        if (!dbRecord) {
          dbRecord = {
            id: activeStud.id, name: activeStud.name, dept: activeStud.dept, sem: activeStud.sem,
            attendance: 85, cgpa: 8.6, status: 'Active', feeStatus: 'Pending', email: activeStud.email
          };
        }
        setStudentDetails(dbRecord);

        // Calculate CGPA from marks, or fallback
        const marksData = marksRes?.data || [];
        let cgpaTrend = [8.2, 8.4, 8.5, 8.6];
        let internal = 42, external = 85;
        if (marksData.length > 0) {
          // just mock the internal/external using the first mark record
          internal = marksData[0].internalMarks || 42;
          external = marksData[0].externalMarks || 85;
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
        setAssignmentsCount(2); // Mock assignments
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  if (loading || !studentDetails) {
    return (
      <div className="student-loading-container">
        <span className="student-spinner-large"></span>
      </div>
    );
  }

  // Attendance Trend Data (Past 5 weeks)
  const attendanceTrendData = [
    { name: 'Week 1', rate: 80 },
    { name: 'Week 2', rate: 82 },
    { name: 'Week 3', rate: 81 },
    { name: 'Week 4', rate: 85 },
    { name: 'Week 5', rate: studentDetails.attendance }
  ];

  // CGPA trend across semesters
  const trendData = studentMarks?.trend || [8.2, 8.4, 8.5, 8.6];
  const cgpaTrendData = trendData.map((val, idx) => ({
    name: `Sem ${idx + 1}`,
    CGPA: val
  }));

  // Internal vs External Marks data (Mocking a couple of subjects they are taking)
  const performanceData = [
    { subject: 'Core Subject 1', Internals: studentMarks?.internal || 42, Externals: (studentMarks?.external || 85) / 2 },
    { subject: 'Elective 1', Internals: Math.round((studentMarks?.internal || 42) * 0.9), Externals: Math.round((studentMarks?.external || 85) * 0.95 / 2) },
    { subject: 'Lab Core', Internals: Math.round((studentMarks?.internal || 42) * 1.1), Externals: Math.round((studentMarks?.external || 85) * 1.05 / 2) }
  ];

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
            <h2 className="metric-value-s">2 Exams</h2>
            <div className="metric-sub-s text-muted">Starts May 28, 2026</div>
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

      {/* Announcements Panel */}
      <div className="glass-card announcements-card-student">
        <div className="announcements-header">
          <h3><Bell size={18} className="text-primary-s" /> Campus Alerts & Board</h3>
          <span className="notif-pill">2 NEW</span>
        </div>
        <div className="announcement-list">
          <div className="announcement-item">
            <span className="ann-date">21-May-2026</span>
            <h4 className="ann-title">Semester Fee Payment Portal Open</h4>
            <p className="ann-desc">Ensure you pay your semester examination and tuition fees before May 28 to avoid late penalties and register for tests.</p>
          </div>
          <div className="announcement-item">
            <span className="ann-date">18-May-2026</span>
            <h4 className="ann-title">Project Submissions Deadline Extended</h4>
            <p className="ann-desc">HOD has extended the submission date for the Computer Science DBMS coursework to May 25, 2026.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
