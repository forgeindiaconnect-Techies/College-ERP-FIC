import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Check, X, Users, Save, Search,
  Filter, CheckCircle, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { getStudents, getAllAttendance, createAttendance } from '../../api/index';
import './StaffAttendance.css';

// Fallback session
const DEFAULT_SESSION = {
  name: 'Dr. Ananya Rao',
  dept: 'Computer Science',
  deptCode: 'CS',
  role: 'Staff',
  subjects: ['Data Structures', 'DBMS']
};



const getTodayDateStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const r = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${r}`;
};

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const getInitials = (name) => name.replace('Dr. ', '').replace('Prof. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const StaffAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staffSession, setStaffSession] = useState(DEFAULT_SESSION);

  // Database states
  const [students, setStudents] = useState([]);
  const [rawAttendanceList, setRawAttendanceList] = useState([]);
  const [dailyLogs, setDailyLogs] = useState({});

  // Filter & selection states
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [search, setSearch] = useState('');
  const [targetSem, setTargetSem] = useState('Sem 1');
  const [subjectsList, setSubjectsList] = useState([]);

  // Marking state
  const [markingState, setMarkingState] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async (activeStaff) => {
    try {
      const [studRes, attRes] = await Promise.all([
        getStudents().catch(() => ({ data: [] })),
        getAllAttendance().catch(() => ({ data: [] }))
      ]);

      const backendStudents = studRes?.data || [];
      const erpStudents = JSON.parse(localStorage.getItem('erp_students') || '[]');
      
      const combinedStudents = [...backendStudents];
      erpStudents.forEach(ls => {
        if (!combinedStudents.find(cs => cs.id === ls.id || cs.rollNo === ls.rollNo)) {
          combinedStudents.push(ls);
        }
      });
      
      setStudents(combinedStudents);

      if (attRes?.data) {
        setRawAttendanceList(attRes.data);
        
        // Map to daily logs format
        const dailyMap = {};
        attRes.data.forEach(record => {
          const dateStr = new Date(record.date).toLocaleDateString('en-CA');
          if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = {};
          }
          dailyMap[dateStr][record.studentId] = record.status.toLowerCase();
        });
        setDailyLogs(dailyMap);
      }
    } catch (err) {
      console.error('Failed to load attendance page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Session check
    const session = sessionStorage.getItem('staff_session');
    let activeStaff = DEFAULT_SESSION;
    if (session) {
      activeStaff = JSON.parse(session);
      setStaffSession(activeStaff);
    } else {
      navigate('/staff/login');
      return;
    }

    let dynSubjects = [];
    let deptInitialized = false;
    const savedSubjects = localStorage.getItem('erp_subjects');
    if (savedSubjects) {
      const allSubs = JSON.parse(savedSubjects);
      const deptSubs = allSubs.filter(s => s.dept === activeStaff.dept);
      
      if (deptSubs.length > 0) {
        deptInitialized = true;
        const mySubs = deptSubs.filter(s => {
          if (!s.teacher) return false;
          const t = s.teacher.toLowerCase().trim();
          const n = activeStaff.name.toLowerCase().trim();
          return t.includes(n) || n.includes(t);
        });
        dynSubjects = [...new Set(mySubs.map(s => s.name))];
      }
    }
    
    if (!deptInitialized && dynSubjects.length === 0) {
      dynSubjects = activeStaff.subjects && activeStaff.subjects.length > 0 ? activeStaff.subjects : ['General Course'];
    }

    if (dynSubjects.length === 0) {
      dynSubjects = ['No Subjects Assigned'];
    }
    
    setSubjectsList(dynSubjects);
    setSelectedSubject(dynSubjects[0]);

    loadData(activeStaff);
  }, [navigate]);

  const staffDept = staffSession.dept;

  // Filter students to current department and class semester
  const myClassStudents = students.filter(s => s.dept === staffDept && s.sem === targetSem);

  // Compute records with current percentage
  const getStudentRecords = () => {
    return myClassStudents.map(s => {
      const matches = rawAttendanceList.filter(r => r.studentId === s.id);
      const presentDays = matches.filter(r => r.status.toLowerCase() === 'present').length;
      const totalDays = matches.length;
      let baseAtt = 85;
      if (s.attendance) {
        const parsed = parseInt(String(s.attendance).replace('%', '').trim());
        if (!isNaN(parsed)) baseAtt = parsed;
      }
      const percent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : baseAtt;

      return {
        ...s,
        presentDays,
        absentDays: totalDays - presentDays,
        percent
      };
    });
  };

  const records = getStudentRecords();

  // Search filter
  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const existing = dailyLogs[selectedDate] || {};
    const initialMarking = {};
    myClassStudents.forEach(s => {
      initialMarking[s.id] = existing[s.id] || ''; // default unmarked
    });
    setMarkingState(initialMarking);
  }, [selectedDate, selectedSubject, dailyLogs, students, targetSem]);

  // Bulk marking
  const handleBulkMark = (status) => {
    const updated = { ...markingState };
    filteredRecords.forEach(r => {
      updated[r.id] = status;
    });
    setMarkingState(updated);
  };

  const handleMarkStudent = (studentId, status) => {
    setMarkingState(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? '' : status
    }));
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    const unmarked = myClassStudents.filter(s => !markingState[s.id]);
    if (unmarked.length > 0) {
      alert(`Please mark attendance for all students. ${unmarked.length} student(s) unmarked.`);
      return;
    }

    try {
      const bulkRecords = myClassStudents.map(s => ({
        studentId: s.id,
        studentName: s.name,
        department: staffDept,
        semester: targetSem,
        date: new Date(selectedDate),
        status: markingState[s.id] === 'present' ? 'Present' : 'Absent',
        subject: selectedSubject,
        markedBy: staffSession.name
      }));

      const res = await createAttendance(bulkRecords);
      if (res?.status === 201 || res?.status === 200) {
        setSaveSuccess(true);
        await loadData(staffSession);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to save attendance:', err);
    }
  };

  // Save Full Day attendance
  const handleSaveFullDayAttendance = async () => {
    const unmarked = myClassStudents.filter(s => !markingState[s.id]);
    if (unmarked.length > 0) {
      alert(`Please mark attendance for all students. ${unmarked.length} student(s) unmarked.`);
      return;
    }

    try {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[new Date(selectedDate).getDay()];
      const savedTimetable = JSON.parse(localStorage.getItem('erp_timetable') || '[]');
      
      let todaySubjects = savedTimetable
        .filter(s => s.dept === staffDept && s.day.toLowerCase() === dayName.toLowerCase())
        .map(s => s.subject);
        
      todaySubjects = [...new Set(todaySubjects)];
      if (todaySubjects.length === 0) {
        todaySubjects = subjectsList; // Fallback to all assigned subjects
      }

      let allBulkRecords = [];
      todaySubjects.forEach(subject => {
        const recordsForSubject = myClassStudents.map(s => ({
          studentId: s.id,
          studentName: s.name,
          department: staffDept,
          semester: targetSem,
          date: new Date(selectedDate),
          status: markingState[s.id] === 'present' ? 'Present' : 'Absent',
          subject: subject,
          markedBy: staffSession.name
        }));
        allBulkRecords = [...allBulkRecords, ...recordsForSubject];
      });

      const res = await createAttendance(allBulkRecords);
      if (res?.status === 201 || res?.status === 200) {
        setSaveSuccess(true);
        await loadData(staffSession);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to save full day attendance:', err);
    }
  };

  const getColor = (p) => p >= 90 ? 'var(--success)' : p >= 75 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="attendance-management-staff animate-fade-in">
      <div className="page-header-staff">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/staff/dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1>Take Attendance</h1>
            <p className="text-muted">Record daily roll call for students under your assigned courses.</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="success-banner">
            <CheckCircle size={18} /> Attendance updated successfully!
          </div>
        )}
      </div>

      {/* Course & Date Selector Row */}
      <div className="glass-card selection-card">
        <div className="selectors-row">
          <div className="selector-group">
            <label><Users size={14} /> Subject / Course</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="selector-select"
            >
              {subjectsList.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label><Calendar size={14} /> Class Group (Semester)</label>
            <select
              value={targetSem}
              onChange={e => setTargetSem(e.target.value)}
              className="selector-select"
            >
              {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map(sem => (
                <option key={sem} value={sem}>{staffDept} - {sem}</option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label><Calendar size={14} /> Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="selector-date"
            />
          </div>
        </div>
      </div>

      {/* Directory / Marking Panel */}
      <div className="glass-card table-section-card">
        <div className="table-filters-bar">
          <div className="search-box-attendance">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search student by name or register no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="bulk-actions-group">
            <button className="btn-bulk present" onClick={() => handleBulkMark('present')}>
              Mark All Present
            </button>
            <button className="btn-bulk absent" onClick={() => handleBulkMark('absent')}>
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="table-container-attendance">
          <table>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Student Details</th>
                <th>Register No</th>
                <th>Semester</th>
                <th>Current Attendance</th>
                <th style={{ width: '220px', textAlign: 'center' }}>Mark Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: '20px', borderRadius: '4px' }}></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-students">No students registered in this class.</td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const status = markingState[r.id] || '';
                  return (
                    <tr key={r.id}>
                      <td className="text-muted">{idx + 1}</td>
                      <td>
                        <div className="student-profile-cell">
                          <div
                            className="student-avatar-cell"
                            style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                          >
                            {getInitials(r.name)}
                          </div>
                          <div>
                            <p className="student-name-text">{r.name}</p>
                            <p className="student-email-text">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="register-no-badge">{r.id}</span></td>
                      <td><span className="sem-badge-cell">{r.sem}</span></td>
                      <td>
                        <div className="att-progress-cell">
                          <span style={{ color: getColor(r.percent), fontWeight: 700 }}>{r.percent}%</span>
                          <div className="progress-bg">
                            <div
                              className="progress-fill"
                              style={{ width: `${r.percent}%`, backgroundColor: getColor(r.percent) }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="marking-toggles">
                          <button
                            type="button"
                            className={`toggle-btn present ${status === 'present' ? 'active' : ''}`}
                            onClick={() => handleMarkStudent(r.id, 'present')}
                          >
                            <Check size={14} /> Present
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn absent ${status === 'absent' ? 'active' : ''}`}
                            onClick={() => handleMarkStudent(r.id, 'absent')}
                          >
                            <X size={14} /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="save-bar">
          <p className="text-muted text-sm">
            Make sure to double check all fields before logging the attendance sheet.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              className="btn-save-attendance-sheet"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', boxShadow: 'none' }}
              onClick={handleSaveFullDayAttendance}
              disabled={filteredRecords.length === 0}
              title="Saves this attendance status for ALL subjects scheduled today"
            >
              <CheckCircle size={16} /> Save Full Day
            </button>
            <button
              type="button"
              className="btn-save-attendance-sheet"
              onClick={handleSaveAttendance}
              disabled={filteredRecords.length === 0}
            >
              <Save size={16} /> Save Subject Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAttendance;
