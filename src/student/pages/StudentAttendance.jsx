import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, ShieldAlert, CheckCircle, Search, ArrowLeft, Calendar } from 'lucide-react';
import { getAttendanceByStudent } from '../../api/index';
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

  // Dynamic state
  const [attendancePercent, setAttendancePercent] = useState(85);
  const [attendanceLogs, setAttendanceLogs] = useState([]);

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

    const loadAttendance = async () => {
      try {
        const res = await getAttendanceByStudent(activeStud.id || activeStud.referenceId || activeStud._id);
        if (res?.data) {
          const records = res.data;
          const presentCount = records.filter(r => r.status?.toLowerCase() === 'present').length;
          const totalDays = records.length;
          const percent = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 85;

          setAttendancePercent(percent);

          const logs = records.map(r => ({
            date: new Date(r.date).toLocaleDateString('en-CA'),
            subject: r.subject || 'All Subjects',
            status: r.status?.toLowerCase() || 'present'
          }));
          // Sort descending by date
          logs.sort((a, b) => new Date(b.date) - new Date(a.date));
          setAttendanceLogs(logs);
        }
      } catch (err) {
        console.error('Failed to fetch backend student attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [navigate]);

  return (
    <div className="student-attendance-page animate-fade-in">
      <div className="page-header-student">
        <div className="header-left-s">
          <button className="btn-back-s" onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1>Attendance History</h1>
            <p className="text-muted">Track your daily roll call sheets, aggregates, and minimum thresholds.</p>
          </div>
        </div>
      </div>

      {/* Aggregate Banner */}
      <div className="glass-card attendance-hero-card">
        <div className="hero-progress-circle-wrapper">
          <div className="hero-progress-text">
            <h2>{attendancePercent}%</h2>
            <span>Attendance</span>
          </div>
        </div>
        <div className="hero-details">
          <h3>Your Attendance Summary</h3>
          <p className="text-muted">You have registered high attendance levels for the current semester semester course classes.</p>
          <div className="summary-status-tag-row">
            {attendancePercent >= 75 ? (
              <span className="badge-success-s"><CheckCircle size={14} /> Safe Zone</span>
            ) : (
              <span className="badge-danger-s"><ShieldAlert size={14} /> Shortage Warning (Below 75%)</span>
            )}
            <span className="badge-neutral-s">Required: 75%</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card table-section-card-s">
        <div className="table-header-row-s">
          <h3>Daily Log Sheet</h3>
          <div className="search-box-attendance">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search by subject or date..." disabled style={{ opacity: 0.6 }} />
          </div>
        </div>

        <div className="table-container-s">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Subject Taught</th>
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
                  <td colSpan={4} className="text-center py-4">No daily logs found.</td>
                </tr>
              ) : (
                attendanceLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="text-muted">{idx + 1}</td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={13} className="text-muted" />
                        <span>{log.date}</span>
                      </div>
                    </td>
                    <td><span className="font-semibold">{log.subject}</span></td>
                    <td>
                      <span className={`status-badge-cell ${log.status}`}>
                        {log.status === 'present' ? '✓ Present' : '⚠ Absent'}
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
  );
};

export default StudentAttendance;
