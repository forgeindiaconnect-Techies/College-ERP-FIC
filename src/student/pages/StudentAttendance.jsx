import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, ShieldAlert, CheckCircle, Search, ArrowLeft, Calendar, BookOpen, Clock, User, XCircle, FileText } from 'lucide-react';
import { getAttendanceByStudent } from '../../api/index';
import useRealtimeSync from '../../hooks/useRealtimeSync';
import './StudentAttendance.css';

// Fallbacks
const DEFAULT_STUDENT = {
  id: 'CS2022001',
  name: 'John Doe',
  dept: 'Computer Science',
  sem: 'Sem 6',
  email: 'john@college.edu'
};

const StudentAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentSession, setStudentSession] = useState(DEFAULT_STUDENT);

  // Dynamic states
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [subjectWise, setSubjectWise] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    percentage: 0
  });

  const fetchAttendanceData = React.useCallback(async (studentId) => {
    try {
      if (!studentId || studentId === 'CS2022001') return;

      // Ensure we are using the correct Register Number (like ST2026010), not a MongoDB _id
      let finalId = studentId;
      if (studentId.length === 24 && /^[0-9a-fA-F]{24}$/.test(studentId)) {
        const erpStudents = JSON.parse(localStorage.getItem(`erp_students_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`) || '[]');
        const match = erpStudents.find(s => s._id === studentId || s.id === studentId);
        if (match && match.id) {
          finalId = match.id;
        }
      }
      
      let apiData = [];
      try {
        const res = await getAttendanceByStudent(finalId);
        if (res && res.data) apiData = res.data;
      } catch (apiErr) {
        console.error('API fetch failed, falling back to local storage:', apiErr);
      }

      // Merge with localStorage
      const localAttendance = JSON.parse(localStorage.getItem(`erp_attendance_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`) || '[]');
      const finalName = studentSession?.name ? studentSession.name.toLowerCase() : '';
      const localRecords = localAttendance.filter(r => 
        r.studentId === finalId || 
        r.studentId === studentId || 
        (r.studentName && finalName && r.studentName.toLowerCase() === finalName)
      );
      
      const allRecords = [...apiData, ...localRecords];
      // Deduplicate by _id
      const records = [];
      const seenIds = new Set();
      allRecords.forEach(r => {
        if (!seenIds.has(r._id)) {
          seenIds.add(r._id);
          records.push(r);
        }
      });

      if (records.length > 0) {
        
        // Basic Analytics
        const totalDays = records.length;
        const presentCount = records.filter(r => r.status?.toLowerCase() === 'present').length;
        const absentCount = records.filter(r => r.status?.toLowerCase() === 'absent').length;
        const leaveCount = records.filter(r => r.status?.toLowerCase() === 'leave').length;
        const percentage = Math.round((presentCount / totalDays) * 100);

        setAnalytics({
          total: totalDays,
          present: presentCount,
          absent: absentCount,
          leave: leaveCount,
          percentage
        });

        // Daily Logs
        const logs = records.map(r => ({
          date: new Date(r.date).toLocaleDateString('en-GB').replace(/\//g, '-'),
          subject: r.subject || 'General',
          status: r.status?.toLowerCase() || 'present',
          faculty: r.markedBy || 'System'
        }));
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendanceLogs(logs);

        // Subject-Wise Aggregation
        const subjectsMap = {};
        records.forEach(r => {
          const sub = r.subject || 'General';
          if (!subjectsMap[sub]) subjectsMap[sub] = { total: 0, present: 0 };
          subjectsMap[sub].total += 1;
          if (r.status?.toLowerCase() === 'present') subjectsMap[sub].present += 1;
        });
        
        const subArray = Object.keys(subjectsMap).map(sub => ({
          subject: sub,
          total: subjectsMap[sub].total,
          present: subjectsMap[sub].present,
          percent: Math.round((subjectsMap[sub].present / subjectsMap[sub].total) * 100)
        }));
        setSubjectWise(subArray.sort((a, b) => b.percent - a.percent));

        // Monthly Aggregation
        const monthsMap = {};
        records.forEach(r => {
          const d = new Date(r.date);
          const monthStr = d.toLocaleString('default', { month: 'long', year: 'numeric' });
          if (!monthsMap[monthStr]) monthsMap[monthStr] = { total: 0, present: 0, sortKey: d.getTime() };
          monthsMap[monthStr].total += 1;
          if (r.status?.toLowerCase() === 'present') monthsMap[monthStr].present += 1;
        });

        const monthArray = Object.keys(monthsMap).map(m => ({
          month: m,
          sortKey: monthsMap[m].sortKey,
          percent: Math.round((monthsMap[m].present / monthsMap[m].total) * 100)
        }));
        setMonthly(monthArray.sort((a, b) => b.sortKey - a.sortKey));

      } else {
        // Fallbacks for empty database
        const erpStudents = JSON.parse(localStorage.getItem(`erp_students_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`) || '[]');
        const localMatch = erpStudents.find(s => s.rollNo === studentId || s.id === studentId);
        if (localMatch && localMatch.attendance) {
          const parsed = parseInt(String(localMatch.attendance).replace('%', '').trim());
          if (!isNaN(parsed)) setAnalytics(prev => ({ ...prev, percentage: parsed }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch backend student attendance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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

    const studentId = activeStud.referenceId || activeStud.id || activeStud._id;
    fetchAttendanceData(studentId);
  }, [navigate, fetchAttendanceData]);

  // Hook up real-time auto-refresh mechanism
  const refreshAttendance = React.useCallback(() => {
    const studentId = studentSession.referenceId || studentSession.id || studentSession._id;
    if (studentId) {
      fetchAttendanceData(studentId);
    }
  }, [studentSession, fetchAttendanceData]);

  useRealtimeSync(refreshAttendance, ['attendance']);

  const getProgressClass = (percent) => {
    if (percent >= 75) return 'safe';
    if (percent >= 65) return 'warning';
    return 'danger';
  };

  return (
    <div className="student-attendance-page animate-fade-in">
      <div className="page-header-student">
        <div className="header-left-s">
          
          <div>
            <h1>Attendance Center</h1>
            <p className="text-muted">Track your subject-wise thresholds, monthly progress, and daily logs.</p>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="analytics-grid">
        <div className="glass-card analytics-card primary">
          <span>Overall Percentage</span>
          <h2>{analytics.percentage}%</h2>
        </div>
        <div className="glass-card analytics-card info">
          <span>Total Working Days</span>
          <h2>{analytics.total}</h2>
        </div>
        <div className="glass-card analytics-card success">
          <span>Present Days</span>
          <h2>{analytics.present}</h2>
        </div>
        <div className="glass-card analytics-card danger">
          <span>Absent Days</span>
          <h2>{analytics.absent}</h2>
        </div>
        <div className="glass-card analytics-card warning">
          <span>Approved Leaves</span>
          <h2>{analytics.leave}</h2>
        </div>
      </div>

      <div className="attendance-tables-grid">
        {/* Subject-Wise Table */}
        <div className="glass-card table-section-card-s">
          <div className="table-header-row-s">
            <h3><BookOpen size={18} /> Subject-Wise Attendance</h3>
          </div>
          <div className="table-container-s">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Classes Attended</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-4">Loading subjects...</td></tr>
                ) : subjectWise.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4">No subject data available.</td></tr>
                ) : (
                  subjectWise.map((sub, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="subject-cell-title">{sub.subject}</div>
                        <div className="subject-cell-subtitle">Total Classes: {sub.total}</div>
                      </td>
                      <td className="font-semibold">{sub.present} / {sub.total}</td>
                      <td>
                        <div className="font-semibold" style={{ color: sub.percent >= 75 ? '#10b981' : sub.percent >= 65 ? '#f59e0b' : '#ef4444' }}>
                          {sub.percent}%
                        </div>
                        <div className="progress-bar-bg">
                          <div className={`progress-bar-fill ${getProgressClass(sub.percent)}`} style={{ width: `${sub.percent}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="glass-card table-section-card-s">
          <div className="table-header-row-s">
            <h3><CalendarCheck size={18} /> Monthly Report</h3>
          </div>
          <div className="table-container-s">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} className="text-center py-4">Loading monthly data...</td></tr>
                ) : monthly.length === 0 ? (
                  <tr><td colSpan={2} className="text-center py-4">No monthly data available.</td></tr>
                ) : (
                  monthly.map((m, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold">{m.month}</td>
                      <td>
                        <span className={`status-badge-cell ${m.percent >= 75 ? 'present' : 'absent'}`}>
                          {m.percent}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Daily Log Table */}
      <div className="glass-card table-section-card-s">
        <div className="table-header-row-s">
          <h3><FileText size={18} /> Daily Attendance Log</h3>
          <div className="search-box-attendance" style={{ background: 'var(--bg-primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
            <Search size={16} className="text-muted" />
            <input type="text" placeholder="Search logs..." disabled style={{ opacity: 0.6, background: 'transparent', border: 'none', outline: 'none' }} />
          </div>
        </div>

        <div className="table-container-s">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject Taught</th>
                <th>Faculty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: '20px', borderRadius: '4px' }}></div></td>
                    ))}
                  </tr>
                ))
              ) : attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted">No daily logs found. Your attendance hasn't been marked yet.</td>
                </tr>
              ) : (
                attendanceLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} className="text-muted" />
                        <span>{log.date}</span>
                      </div>
                    </td>
                    <td><span className="font-semibold">{log.subject}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <User size={13} className="text-muted" /> {log.faculty}
                      </div>
                    </td>
                    <td>
                      {log.status === 'present' && <span className="status-badge-cell present"><CheckCircle size={12} /> Present</span>}
                      {log.status === 'absent' && <span className="status-badge-cell absent"><XCircle size={12} /> Absent</span>}
                      {log.status === 'leave' && <span className="status-badge-cell leave"><Clock size={12} /> Approved Leave</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
