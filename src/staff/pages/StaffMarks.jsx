import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Edit2, X, CheckCircle, Percent, Hash,
  AlertTriangle, ArrowLeft, BookOpen, GraduationCap
} from 'lucide-react';
import { getStudents, getAllMarks, createMark, updateMark } from '../../api/index';
import './StaffMarks.css';

// Fallback session
const DEFAULT_SESSION = {
  name: 'Dr. Ananya Rao',
  dept: 'Computer Science',
  deptCode: 'CS',
  role: 'Staff',
  subjects: ['Data Structures', 'DBMS']
};

const SUBJECT_TO_CLASS = {
  'Data Structures': 'Sem 3',
  'DBMS': 'Sem 6',
  'OS': 'Sem 4',
  'Machine Learning': 'Sem 6',
  'Circuits': 'Sem 4',
  'Networks': 'Sem 4',
  'Thermodynamics': 'Sem 2',
  'Fluid Mechanics': 'Sem 2',
  'Structural Analysis': 'Sem 8'
};

const AVATAR_COLORS = ['bg-gradient-blue', 'bg-gradient-purple', 'bg-gradient-orange', 'bg-gradient-green', 'bg-gradient-teal'];

const StaffMarks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staffSession, setStaffSession] = useState(DEFAULT_SESSION);

  // Database states
  const [rawMarksList, setRawMarksList] = useState([]);
  const [students, setStudents] = useState([]);

  // Selections & filters
  const [selectedSubject, setSelectedSubject] = useState('');
  const [search, setSearch] = useState('');

  // Modal edit states
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ _id: null, id: '', name: '', internal: 0, external: 0, cgpa: 0, arrears: 0 });
  const [saved, setSaved] = useState(false);

  const loadData = async () => {
    try {
      const [studRes, marksRes] = await Promise.all([
        getStudents(),
        getAllMarks()
      ]);

      if (studRes?.data) setStudents(studRes.data);
      if (marksRes?.data) setRawMarksList(marksRes.data);
    } catch (err) {
      console.error('Failed to load marks page data:', err);
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

    if (activeStaff.subjects && activeStaff.subjects.length > 0) {
      setSelectedSubject(activeStaff.subjects[0]);
    }

    loadData();
  }, [navigate]);

  const staffDept = staffSession.dept;
  const targetSem = SUBJECT_TO_CLASS[selectedSubject] || 'Sem 3';

  // Filter students to current department and class semester
  const myClassStudents = students.filter(s => s.dept === staffDept && s.sem === targetSem);

  // Compute records by merging students with their marks in selectedSubject
  const getStudentMarksRecords = () => {
    return myClassStudents.map(s => {
      const match = rawMarksList.find(m => m.studentId === s.id && m.subject === selectedSubject);
      if (match) {
        return {
          _id: match._id,
          id: s.id,
          name: s.name,
          sem: s.sem,
          dept: s.dept,
          internal: match.internalMarks || 0,
          external: match.semesterMarks || 0,
          gpa: match.gpa || 0,
          cgpa: match.cgpa || s.cgpa || 0,
          arrears: match.arrearStatus === 'Arrear' ? 1 : 0
        };
      } else {
        return {
          _id: null,
          id: s.id,
          name: s.name,
          sem: s.sem,
          dept: s.dept,
          internal: 0,
          external: 0,
          gpa: 0,
          cgpa: s.cgpa || 0,
          arrears: 0
        };
      }
    });
  };

  const filteredMarks = getStudentMarksRecords().filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase())
  );

  const getCgpaColor = (c) => c >= 9 ? 'var(--success)' : c < 7 ? 'var(--danger)' : 'var(--warning)';
  const getGrade = (c) => c >= 9 ? 'O' : c >= 8 ? 'A+' : c >= 7 ? 'A' : c >= 6 ? 'B+' : 'B';

  const openEdit = (m) => {
    setForm({
      _id: m._id,
      id: m.id,
      name: m.name,
      internal: m.internal,
      external: m.external,
      cgpa: m.cgpa,
      arrears: m.arrears
    });
    setEditTarget(m.id);
    setSaved(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleFormChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      const payload = {
        studentId: form.id,
        studentName: form.name,
        department: staffDept,
        semester: targetSem,
        subject: selectedSubject,
        internalMarks: Number(form.internal),
        semesterMarks: Number(form.external),
        cgpa: Number(form.cgpa),
        arrearStatus: Number(form.arrears) > 0 ? 'Arrear' : 'Pass'
      };

      let res;
      if (form._id) {
        res = await updateMark(form._id, payload);
      } else {
        res = await createMark(payload);
      }

      if (res?.status === 200 || res?.status === 201) {
        setSaved(true);
        await loadData();
        setTimeout(() => {
          closeModal();
          setSaved(false);
        }, 800);
      }
    } catch (err) {
      console.error('Failed to update student mark:', err);
    }
  };

  return (
    <div className="marks-management-staff animate-fade-in">
      <div className="page-header-staff">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/staff/dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1>Upload Marks</h1>
            <p className="text-muted">Grade coursework, internals, and semester scores for students in your classes.</p>
          </div>
        </div>
      </div>

      {/* Select Course Card */}
      <div className="glass-card selection-card">
        <div className="selectors-row">
          <div className="selector-group">
            <label><BookOpen size={14} /> Course / Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="selector-select"
            >
              {(staffSession.subjects || []).map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label><GraduationCap size={14} /> Class Group</label>
            <input
              type="text"
              disabled
              value={`${staffDept} - ${targetSem}`}
              className="selector-input-disabled"
            />
          </div>
        </div>
      </div>

      {/* Marks Directory Table */}
      <div className="glass-card table-section-card">
        <div className="table-filters-bar">
          <h3>Student Grades Sheet</h3>
          <div className="search-box-attendance">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container-attendance">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Register No</th>
                <th>Name</th>
                <th>Sem</th>
                <th>Internal (50)</th>
                <th>External (100)</th>
                <th>GPA</th>
                <th>CGPA</th>
                <th>Grade</th>
                <th>Arrears</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: '20px', borderRadius: '4px' }}></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={11} className="no-students">No student academic records found.</td>
                </tr>
              ) : (
                filteredMarks.map((m, idx) => (
                  <tr key={m.id}>
                    <td className="text-muted">{idx + 1}</td>
                    <td><span className="register-no-badge">{m.id}</span></td>
                    <td>
                      <div className="student-profile-cell">
                        <div className={`student-avatar-cell ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {m.name[0]}
                        </div>
                        <span className="font-semibold">{m.name}</span>
                      </div>
                    </td>
                    <td><span className="sem-badge-cell">{m.sem}</span></td>
                    <td>
                      <span className={m.internal < 20 ? 'text-danger font-semibold' : 'font-semibold'}>
                        {m.internal}
                      </span>
                    </td>
                    <td>
                      <span className={m.external < 35 ? 'text-danger font-semibold' : 'font-semibold'}>
                        {m.external}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: getCgpaColor(m.gpa), fontWeight: 600 }}>
                        {m.gpa}
                      </span>
                    </td>
                    <td>
                      <div className="att-progress-cell">
                        <span style={{ color: getCgpaColor(m.cgpa), fontWeight: 700 }}>{m.cgpa}</span>
                        <div className="progress-bg" style={{ width: '60px' }}>
                          <div
                            className="progress-fill"
                            style={{ width: `${(m.cgpa / 10) * 100}%`, backgroundColor: getCgpaColor(m.cgpa) }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="grade-badge-cell"
                        style={{
                          background: getCgpaColor(m.cgpa) + '15',
                          color: getCgpaColor(m.cgpa),
                          border: `1px solid ${getCgpaColor(m.cgpa)}30`
                        }}
                      >
                        {getGrade(m.cgpa)}
                      </span>
                    </td>
                    <td>
                      {m.arrears === 0 ? (
                        <span className="text-success font-semibold">✓ Clear</span>
                      ) : (
                        <span className="text-danger font-semibold">⚠ {m.arrears}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-icon-edit" title="Log/Update Marks" onClick={() => openEdit(m)}>
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Update Student Marks</h2>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                  Log internal assessments and final exam grades.
                </p>
              </div>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>

            {saved && (
              <div className="modal-success-flash">
                <CheckCircle size={18} /> Student marks updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Student Name</label>
                  <input disabled value={form.name} style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label>Register No</label>
                  <input disabled value={form.id} style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label><Percent size={13} /> Internal Marks (Max 50)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={form.internal}
                    onChange={e => handleFormChange('internal', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label><Percent size={13} /> External Marks (Max 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={form.external}
                    onChange={e => handleFormChange('external', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label><Hash size={13} /> Cumulative CGPA (0.0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={form.cgpa}
                    onChange={e => handleFormChange('cgpa', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label><AlertTriangle size={13} /> Active Arrears</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={form.arrears}
                    onChange={e => handleFormChange('arrears', e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Update Scores</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffMarks;
