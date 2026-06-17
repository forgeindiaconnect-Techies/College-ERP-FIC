import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Check, X, Users, Save, Search,
  Filter, CheckCircle, AlertTriangle, ArrowLeft,
  Clock, ShieldAlert, HeartPulse, UserMinus
} from 'lucide-react';
import { getStudents, getAllAttendance, createAttendance, getTimetable } from '../../api/index';
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

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366F1'];
const getInitials = (name) => name.replace('Dr. ', '').replace('Prof. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const DEPT_SUBJECTS = {
  'Computer Science Engineering': ['Data Structures', 'DBMS', 'Networks', 'OS', 'Machine Learning', 'AI', 'Cloud Computing', 'Cryptography'],
  'Information Technology': ['Web Technologies', 'Software Engineering', 'DBMS', 'Cyber Security', 'Data Science', 'IoT'],
  'Electronics & Communication Engineering': ['Circuits', 'Signals and Systems', 'Microprocessors', 'Digital Logic', 'VLSI Design', 'Antenna Theory'],
  'Electrical & Electronics Engineering': ['Power Systems', 'Control Systems', 'Machines', 'Power Electronics', 'High Voltage Engineering'],
  'Mechanical Engineering': ['Thermodynamics', 'Fluid Mechanics', 'Kinematics', 'Machine Design', 'Robotics', 'Heat Transfer'],
  'Civil Engineering': ['Structural Analysis', 'Concrete Technology', 'Geotechnical Engineering', 'Surveying', 'Fluid Mechanics'],
  'Artificial Intelligence & Data Science': ['Machine Learning', 'Deep Learning', 'Big Data', 'Data Mining', 'Python Programming', 'NLP'],
  'Artificial Intelligence & Machine Learning': ['Neural Networks', 'AI Ethics', 'Computer Vision', 'Pattern Recognition', 'Robotics', 'Algorithms'],
  'Cyber Security': ['Network Security', 'Cryptography', 'Ethical Hacking', 'Forensics', 'Malware Analysis'],
  'Biomedical Engineering': ['Biomechanics', 'Biomaterials', 'Medical Imaging', 'Biosensors', 'Human Anatomy'],
  'Aeronautical Engineering': ['Aerodynamics', 'Propulsion', 'Flight Mechanics', 'Aircraft Structures', 'Avionics'],
  'Automobile Engineering': ['Vehicle Dynamics', 'Engine Systems', 'Automotive Electronics', 'Chassis Design'],
  'Robotics Engineering': ['Kinematics', 'Sensors and Actuators', 'Control Systems', 'AI for Robotics', 'Machine Vision'],
  'Chemical Engineering': ['Fluid Mechanics', 'Mass Transfer', 'Heat Transfer', 'Chemical Reaction Engineering', 'Process Control'],
  'Biotechnology Engineering': ['Genetics', 'Cell Biology', 'Bioprocess Engineering', 'Immunology', 'Bioinformatics'],
  // Shorthands
  'Computer Science': ['Data Structures', 'DBMS', 'Networks', 'OS', 'Machine Learning', 'AI'],
  'Electronics & Comm.': ['Circuits', 'Signals and Systems', 'Microprocessors'],
  'Electrical Engg.': ['Power Systems', 'Control Systems', 'Machines'],
  'Mechanical Engg.': ['Thermodynamics', 'Fluid Mechanics', 'Kinematics']
};

const StaffAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staffSession, setStaffSession] = useState(DEFAULT_SESSION);

  // Database states
  const [students, setStudents] = useState([]);
  const [rawAttendanceList, setRawAttendanceList] = useState([]);
  
  // Timetable states
  const [timetable, setTimetable] = useState({ times: [], schedule: [] });

  // Filter & selection states
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Period 1');
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [search, setSearch] = useState('');
  const [targetSem, setTargetSem] = useState('Sem 6'); // Default to Sem 6 for mock data visibility
  const [subjectsList, setSubjectsList] = useState([]);
  const [periodsList, setPeriodsList] = useState([]);

  // Marking state
  const [markingState, setMarkingState] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const loadData = async (activeStaff, sem) => {
    try {
      setLoading(true);
      const [studRes, attRes, ttRes] = await Promise.all([
        getStudents().catch(() => ({ data: [] })),
        getAllAttendance().catch(() => ({ data: [] })),
        getTimetable(activeStaff.dept, sem).catch(() => ({ data: { times: [], schedule: [] } }))
      ]);

      const backendStudents = studRes?.data || [];
      const erpStudents = JSON.parse(localStorage.getItem(`erp_students_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`) || '[]');
      
      const combinedStudents = [...backendStudents];
      erpStudents.forEach(ls => {
        if (!combinedStudents.find(cs => cs.id === ls.id || cs.rollNo === ls.rollNo)) {
          combinedStudents.push(ls);
        }
      });
      setStudents(combinedStudents);

      if (attRes?.data) {
        setRawAttendanceList(attRes.data);
      }

      const ttData = ttRes?.data || { times: [], schedule: [] };
      setTimetable(ttData);

      // Extract subjects assigned to this staff member
      const mySchedule = ttData.schedule?.filter(slot => 
        slot.faculty?.toLowerCase().includes(activeStaff.name.toLowerCase().replace('dr. ', '')) ||
        activeStaff.name.toLowerCase().includes(slot.faculty?.toLowerCase() || '')
      ) || [];

      let dynSubjects = [...new Set(mySchedule.map(s => s.subject))];
      if (dynSubjects.length === 0) {
        // Fallback to Master Subject System for this semester and department
        const savedSubjects = localStorage.getItem(`erp_subjects_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`);
        if (savedSubjects) {
          const allSubs = JSON.parse(savedSubjects);
          const deptSubs = allSubs.filter(sub => sub.dept === activeStaff.dept && sub.sem === sem);
          if (deptSubs.length > 0) {
            dynSubjects = [...new Set(deptSubs.map(s => s.name))];
          }
        }
        
        // If still empty, use staff assigned subjects as last resort
        if (dynSubjects.length === 0 && activeStaff.subjects && activeStaff.subjects.length > 0) {
          dynSubjects = activeStaff.subjects;
        } else if (dynSubjects.length === 0) {
          // Fallback to department subjects
          const fallback = DEPT_SUBJECTS[activeStaff.dept] || DEPT_SUBJECTS[activeStaff.dept + ' Engineering'] || [];
          if (fallback.length > 0) {
            dynSubjects = fallback;
          } else {
            dynSubjects = ['No Master Subjects Defined'];
          }
        }
      }
      setSubjectsList(dynSubjects);
      if (!dynSubjects.includes(selectedSubject)) {
        setSelectedSubject(dynSubjects[0]);
      }

      // Extract periods
      const times = ttData.times || [];
      const dynPeriods = times.map((t, i) => `Period ${i + 1} (${t})`);
      setPeriodsList(dynPeriods.length > 0 ? dynPeriods : ['Period 1']);
      if (!dynPeriods.includes(selectedPeriod)) {
        setSelectedPeriod(dynPeriods.length > 0 ? dynPeriods[0] : 'Period 1');
      }

    } catch (err) {
      console.error('Failed to load attendance page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = sessionStorage.getItem('staff_session');
    let activeStaff = DEFAULT_SESSION;
    if (session) {
      activeStaff = JSON.parse(session);
      setStaffSession(activeStaff);
    } else {
      navigate('/staff/login');
      return;
    }
    loadData(activeStaff, targetSem);
  }, [navigate, targetSem]); // Reload timetable when sem changes

  const staffDept = staffSession.dept;

  // Filter students to current department and class semester
  const myClassStudents = students.filter(s => 
    (s.dept === staffDept || s.department === staffDept) && 
    (s.sem === targetSem || s.semester === targetSem)
  );

  // Compute records with current percentage
  const getStudentRecords = () => {
    return myClassStudents.map(s => {
      const matches = rawAttendanceList.filter(r => r.studentId === (s.id || s._id));
      const presentDays = matches.filter(r => r.status === 'Present').length;
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
        percent,
        totalDays
      };
    });
  };

  const records = getStudentRecords();
  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || (r.id || r._id || '').toLowerCase().includes(search.toLowerCase())
  );

  // Initial Marking State
  useEffect(() => {
    const initialMarking = {};
    const formattedDate = new Date(selectedDate);
    formattedDate.setUTCHours(0, 0, 0, 0);

    // See if attendance already exists for this exact session
    const existingSessionRecords = rawAttendanceList.filter(r => {
      const rDate = new Date(r.attendanceDate || r.date);
      rDate.setUTCHours(0,0,0,0);
      return rDate.getTime() === formattedDate.getTime() && 
             (r.subjectId === selectedSubject || r.subject === selectedSubject) && 
             (r.periodId === selectedPeriod.split(' ')[1] || r.period === selectedPeriod.split(' ')[1]);
    });

    myClassStudents.forEach(s => {
      const existingRecord = existingSessionRecords.find(r => r.studentId === (s.id || s._id));
      initialMarking[s.id || s._id] = existingRecord ? existingRecord.status : '';
    });
    setMarkingState(initialMarking);
    setSaveError(''); // Clear error on change
  }, [selectedDate, selectedSubject, selectedPeriod, rawAttendanceList, students, targetSem]);

  // Bulk marking
  const handleBulkMark = (status) => {
    const updated = { ...markingState };
    filteredRecords.forEach(r => {
      updated[r.id || r._id] = status;
    });
    setMarkingState(updated);
  };

  const handleMarkStudent = (studentId, status) => {
    setMarkingState(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? '' : status
    }));
  };

  const isSessionAlreadyMarked = () => {
    const formattedDate = new Date(selectedDate);
    formattedDate.setUTCHours(0, 0, 0, 0);
    return rawAttendanceList.some(r => {
      const rDate = new Date(r.attendanceDate || r.date);
      rDate.setUTCHours(0,0,0,0);
      return rDate.getTime() === formattedDate.getTime() && 
             (r.subjectId === selectedSubject || r.subject === selectedSubject) && 
             (r.periodId === selectedPeriod.split(' ')[1] || r.period === selectedPeriod.split(' ')[1]);
    });
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (isSessionAlreadyMarked()) {
      setSaveError('Attendance already submitted for this subject and date/period.');
      return;
    }

    const unmarked = myClassStudents.filter(s => !markingState[s.id || s._id]);
    if (unmarked.length > 0) {
      alert(`Please mark attendance for all students. ${unmarked.length} student(s) unmarked.`);
      return;
    }

    try {
        const bulkRecords = myClassStudents.map(s => ({
          tenantId: sessionStorage.getItem('tenantId') || 'mock_college_id',
          studentId: s.id || s._id,
          studentName: s.name,
          department: staffDept,
          semester: targetSem,
          attendanceDate: new Date(selectedDate),
          periodId: selectedPeriod.split(' ')[1],
          status: markingState[s.id || s._id],
          subjectId: selectedSubject,
          markedBy: staffSession.name
        }));

      const res = await createAttendance(bulkRecords);
      if (res?.status === 201 || res?.status === 200) {
        setSaveSuccess(true);
        setSaveError('');
        await loadData(staffSession, targetSem);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to save attendance via API, persisting locally:', err);
      // Fallback to localStorage
      try {
        const existingLocal = JSON.parse(localStorage.getItem(`erp_attendance_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`) || '[]');
        
        const bulkRecords = myClassStudents.map(s => ({
          _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          studentId: s.id || s._id,
          studentName: s.name,
          department: staffDept,
          semester: targetSem,
          date: new Date(selectedDate).toISOString(),
          period: selectedPeriod.split(' ')[1],
          status: markingState[s.id || s._id],
          subject: selectedSubject,
          markedBy: staffSession.name
        }));
        
        localStorage.setItem(`erp_attendance_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`, JSON.stringify([...existingLocal, ...bulkRecords]));
        setSaveSuccess(true);
        setSaveError('');
        await loadData(staffSession, targetSem);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
      } catch (e) {
        setSaveError(err.response?.data?.message || 'Failed to save attendance locally.');
      }
    }
  };

  const getColor = (p) => p >= 90 ? 'var(--success)' : p >= 75 ? 'var(--warning)' : 'var(--danger)';

  // Analytics Computation
  const markedStudents = myClassStudents.filter(s => markingState[s.id || s._id]);
  const presentCount = markedStudents.filter(s => markingState[s.id || s._id] === 'Present').length;
  const absentCount = markedStudents.filter(s => markingState[s.id || s._id] === 'Absent').length;
  const leaveCount = markedStudents.filter(s => markingState[s.id || s._id] === 'On Leave').length;
  const medicalCount = markedStudents.filter(s => markingState[s.id || s._id] === 'Medical Leave').length;
  const totalMarked = markedStudents.length;
  const attRate = totalMarked > 0 ? ((presentCount / totalMarked) * 100).toFixed(1) : 0;

  return (
    <div className="attendance-management-staff animate-fade-in">
      {/* Faculty Info Banner */}
      <div className="mb-4 bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex justify-between items-center dark:bg-blue-900/10 dark:border-blue-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-sm">
            {getInitials(staffSession.name)}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-main)] m-0">{staffSession.name}</h3>
            <p className="text-sm text-[var(--text-muted)] m-0">{staffSession.dept} Department</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-[var(--text-main)] m-0">{new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold m-0">{selectedSubject !== 'No Subjects Assigned' ? selectedSubject : ''}</p>
        </div>
      </div>

      <div className="page-header-staff" style={{ marginTop: 0 }}>
        <div className="header-left">
          
          <div>
            <h1>Take Attendance</h1>
            <p className="text-muted">Record period-wise roll call for your assigned subjects.</p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="success-banner mb-4">
          <CheckCircle size={18} /> Attendance submitted successfully to central database!
        </div>
      )}
      {saveError && (
        <div className="p-4 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-2 font-medium dark:bg-red-900/20 dark:border-red-800/30">
          <AlertTriangle size={18} /> {saveError}
        </div>
      )}

      {/* Course, Period & Date Selector Row */}
      <div className="glass-card selection-card">
        <div className="selectors-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="selector-group">
            <label><Users size={14} /> Class Group (Semester)</label>
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
            <label><Filter size={14} /> Assigned Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="selector-select"
              disabled={subjectsList[0] === 'No Subjects Assigned'}
            >
              {subjectsList.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label><Clock size={14} /> Period / Hour</label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="selector-select"
            >
              {periodsList.map(p => (
                <option key={p} value={p}>{p}</option>
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

      {/* Analytics Banner */}
      {!loading && filteredRecords.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="glass-card p-4 text-center" style={{ flex: '1', minWidth: '120px' }}>
            <p className="text-sm text-[var(--text-muted)] font-medium mb-1">Total Students</p>
            <h3 className="text-xl font-bold text-[var(--text-main)] m-0">{myClassStudents.length}</h3>
          </div>
          <div className="glass-card p-4 text-center" style={{ flex: '1', minWidth: '120px', borderBottom: '4px solid #10b981' }}>
            <p className="text-sm text-[var(--text-muted)] font-medium mb-1">Present</p>
            <h3 className="text-xl font-bold" style={{ color: '#10b981', margin: 0 }}>{presentCount}</h3>
          </div>
          <div className="glass-card p-4 text-center" style={{ flex: '1', minWidth: '120px', borderBottom: '4px solid #ef4444' }}>
            <p className="text-sm text-[var(--text-muted)] font-medium mb-1">Absent</p>
            <h3 className="text-xl font-bold" style={{ color: '#ef4444', margin: 0 }}>{absentCount}</h3>
          </div>
          <div className="glass-card p-4 text-center" style={{ flex: '1', minWidth: '120px', borderBottom: '4px solid #f97316' }}>
            <p className="text-sm text-[var(--text-muted)] font-medium mb-1">On Leave</p>
            <h3 className="text-xl font-bold" style={{ color: '#f97316', margin: 0 }}>{leaveCount + medicalCount}</h3>
          </div>
          <div className="glass-card p-4 text-center" style={{ flex: '1', minWidth: '120px', borderBottom: '4px solid #3b82f6' }}>
            <p className="text-sm text-[var(--text-muted)] font-medium mb-1">Live Rate</p>
            <h3 className="text-xl font-bold" style={{ color: '#3b82f6', margin: 0 }}>{attRate}%</h3>
          </div>
        </div>
      )}

      {/* Directory / Marking Panel */}
      <div className="glass-card table-section-card">
        <div className="table-filters-bar flex flex-wrap gap-4 justify-between items-center p-4 border-b border-[var(--border-color)]">
          <div className="search-box-attendance flex-1 min-w-[250px]">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search student by name or register no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="bulk-actions-group flex gap-2">
            <button className="px-4 py-2 bg-green-500/10 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-500/20 transition-colors" onClick={() => handleBulkMark('Present')}>
              Mark All Present
            </button>
            <button className="px-4 py-2 bg-red-500/10 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-500/20 transition-colors" onClick={() => handleBulkMark('Absent')}>
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="table-container-attendance">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--text-muted)] text-sm">
                <th className="p-4" style={{ width: '50px' }}>#</th>
                <th className="p-4">Student Details</th>
                <th className="p-4">Register No</th>
                <th className="p-4">Current Attendance</th>
                <th className="p-4 text-center">Mark Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border-color)]">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="skeleton" style={{ height: '20px', borderRadius: '4px' }}></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">No students registered in this class.</td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const status = markingState[r.id || r._id] || '';
                  const disabledRow = isSessionAlreadyMarked();
                  
                  const formattedDate = new Date(selectedDate);
                  formattedDate.setUTCHours(0, 0, 0, 0);
                  const savedRecord = rawAttendanceList.find(record => {
                    const rDate = new Date(record.attendanceDate || record.date);
                    rDate.setUTCHours(0,0,0,0);
                    return record.studentId === (r.id || r._id) &&
                           rDate.getTime() === formattedDate.getTime() && 
                           (record.subjectId === selectedSubject || record.subject === selectedSubject) && 
                           (record.periodId === selectedPeriod.split(' ')[1] || record.period === selectedPeriod.split(' ')[1]);
                  });
                  const savedStatus = savedRecord ? savedRecord.status : null;

                  return (
                    <tr key={r.id || r._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="p-4 text-[var(--text-muted)]">{idx + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                          >
                            {getInitials(r.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text-main)] m-0">{r.name}</p>
                            <p className="text-xs text-[var(--text-muted)] m-0">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><span className="font-mono text-sm bg-[var(--bg-secondary)] px-2 py-1 rounded text-[var(--text-main)]">{r.id || r._id}</span></td>
                      <td className="p-4">
                        {savedStatus ? (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                            savedStatus === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                            savedStatus === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            savedStatus === 'Leave' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {savedStatus} {savedStatus === 'Present' ? '(P)' : savedStatus === 'Absent' ? '(A)' : savedStatus === 'Leave' ? '(L)' : '(M)'}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-md dark:bg-gray-800 dark:text-gray-400">
                            No Records Yet
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            disabled={disabledRow}
                            className={`flex items-center justify-center px-3 py-1.5 rounded font-medium text-xs transition-all ${status === 'Present' ? 'bg-green-500 text-white shadow-md' : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'} ${disabledRow ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handleMarkStudent(r.id || r._id, 'Present')}
                            title="Present"
                          >
                            <Check size={14} className="mr-1" /> P
                          </button>
                          <button
                            type="button"
                            disabled={disabledRow}
                            className={`flex items-center justify-center px-3 py-1.5 rounded font-medium text-xs transition-all ${status === 'Absent' ? 'bg-red-500 text-white shadow-md' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'} ${disabledRow ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handleMarkStudent(r.id || r._id, 'Absent')}
                            title="Absent"
                          >
                            <X size={14} className="mr-1" /> A
                          </button>
                          <button
                            type="button"
                            disabled={disabledRow}
                            className={`flex items-center justify-center px-3 py-1.5 rounded font-medium text-xs transition-all ${status === 'On Leave' ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20'} ${disabledRow ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handleMarkStudent(r.id || r._id, 'On Leave')}
                            title="On Leave"
                          >
                            <UserMinus size={14} className="mr-1" /> L
                          </button>
                          <button
                            type="button"
                            disabled={disabledRow}
                            className={`flex items-center justify-center px-3 py-1.5 rounded font-medium text-xs transition-all ${status === 'Medical Leave' ? 'bg-blue-500 text-white shadow-md' : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'} ${disabledRow ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handleMarkStudent(r.id || r._id, 'Medical Leave')}
                            title="Medical Leave"
                          >
                            <HeartPulse size={14} className="mr-1" /> M
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

        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex flex-col justify-center items-center rounded-b-xl gap-4">
          <p className="text-sm text-[var(--text-muted)] flex items-center justify-center gap-2 m-0">
            <ShieldAlert size={16} /> 
            {isSessionAlreadyMarked() ? 'This session has already been logged and locked.' : 'Double check statuses before saving.'}
          </p>
          <button
            type="button"
            className="flex items-center justify-center w-full max-w-md gap-2 px-6 py-3.5 bg-[#ec4899] text-white text-lg font-bold rounded-xl shadow-xl hover:bg-[#db2777] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleSaveAttendance}
            disabled={filteredRecords.length === 0}
          >
            <Save size={20} /> Submit Attendance Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffAttendance;
