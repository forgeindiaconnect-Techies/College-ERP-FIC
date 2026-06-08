import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Edit2, X, CheckCircle, Percent,
  AlertTriangle, ArrowLeft, GraduationCap, Save
} from 'lucide-react';
import { getStudents, getAllMarks, createMark } from '../../api/index';
import './StaffMarks.css';

// Fallback session
const DEFAULT_SESSION = {
  name: 'Dr. Ananya Rao',
  dept: 'Computer Science',
  deptCode: 'CS',
  role: 'Staff'
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
  const [targetSem, setTargetSem] = useState('Sem 5');
  const [search, setSearch] = useState('');

  // Modal edit states
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ id: '', name: '', sem: '', subjects: [] });
  const [saved, setSaved] = useState(false);

  const loadData = async () => {
    try {
      const [studRes, marksRes] = await Promise.all([
        getStudents().catch(() => ({ data: [] })),
        getAllMarks().catch(() => ({ data: [] }))
      ]);

      let backendStudents = studRes?.data || [];
      const erpStudents = JSON.parse(localStorage.getItem('erp_students') || '[]');
      const combinedStudents = [...backendStudents];
      erpStudents.forEach(ls => {
        if (!combinedStudents.find(cs => cs.id === ls.id || cs.rollNo === ls.rollNo)) {
          combinedStudents.push(ls);
        }
      });

      setStudents(combinedStudents);
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
    loadData();
  }, [navigate]);

  const staffDept = staffSession.dept;

  // Filter students to current department and class semester
  const myClassStudents = students.filter(s => s.dept === staffDept && s.sem === targetSem);
  
  const filteredStudents = myClassStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  );

  const getCgpaColor = (c) => c >= 9 ? 'var(--success)' : c < 7 ? 'var(--danger)' : 'var(--warning)';

  const openEdit = (s) => {
    let availableSubjects = [];
    const savedSubjects = localStorage.getItem('erp_subjects');
    let allSubs = [];
    if (savedSubjects) {
      allSubs = JSON.parse(savedSubjects);
      // Force inject AI subjects if missing for testing
      if (!allSubs.find(sub => sub.code === 'AI101')) {
        const aiSubs = [
          { id: 'SUB007', code: 'AI101', name: 'Introduction to AI', dept: 'Artificial Intelligence & Data Science', sem: 'Sem 1', teacher: 'KARTHIK', credits: 4, workload: 4 },
          { id: 'SUB008', code: 'AI102', name: 'Python Programming', dept: 'Artificial Intelligence & Data Science', sem: 'Sem 1', teacher: 'KARTHIK', credits: 3, workload: 4 }
        ];
        allSubs = [...allSubs, ...aiSubs];
        localStorage.setItem('erp_subjects', JSON.stringify(allSubs));
      }
    }
    
    // Filter by department AND semester!
    const deptSubs = allSubs.filter(sub => sub.dept === staffDept && sub.sem === s.sem);
    availableSubjects = [...new Set(deptSubs.map(sub => sub.name))];
    
    // If no subjects defined for this semester yet, give an empty array
    if (availableSubjects.length === 0) {
      console.warn('No subjects found for', staffDept, s.sem);
    }

    // Prepare default rows for each subject in this semester so the staff doesn't even have to add rows!
    const studentSubjects = availableSubjects.map(subName => {
      const existingMark = rawMarksList.find(m => m.studentId === s.id && m.subject === subName);
      return {
        subject: subName,
        internal: existingMark?.internalMarks || 0,
        external: existingMark?.semesterMarks || 0
      };
    });

    setForm({
      id: s.id,
      name: s.name,
      sem: s.sem,
      availableSubjects,
      subjects: studentSubjects.length > 0 ? studentSubjects : [{ subject: '', internal: 0, external: 0 }]
    });
    setEditTarget(s.id);
    setSaved(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSubjectChange = (idx, field, value) => {
    const updatedSubjects = [...form.subjects];
    updatedSubjects[idx][field] = value;
    setForm({ ...form, subjects: updatedSubjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      // Filter out empty subjects
      const validSubjects = form.subjects.filter(sub => sub.subject && sub.subject.trim() !== '');
      if (validSubjects.length === 0) {
        alert('Please enter at least one subject name.');
        return;
      }

      const payloadArray = validSubjects.map(sub => ({
        studentId: form.id,
        studentName: form.name,
        department: staffDept,
        semester: form.sem,
        subject: sub.subject,
        internalMarks: Number(sub.internal),
        semesterMarks: Number(sub.external)
      }));

      // Bulk POST to save all marks at once
      const res = await createMark(payloadArray);

      if (res?.status === 200 || res?.status === 201) {
        setSaved(true);
        await loadData();
        setTimeout(() => {
          closeModal();
          setSaved(false);
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to bulk update student marks:', err);
    }
  };

  return (
    <div className="marks-management-staff animate-fade-in">
      <div className="page-header-staff">
        <div className="header-left">
          
          <div>
            <h1>Upload Marks</h1>
            <p className="text-muted">Enter internals and semester scores for all subjects simultaneously.</p>
          </div>
        </div>
      </div>

      {/* Select Course Card */}
      <div className="glass-card selection-card" style={{ maxWidth: '400px' }}>
        <div className="selectors-row">
          <div className="selector-group">
            <label><GraduationCap size={14} /> Academic Semester</label>
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
        </div>
      </div>

      {/* Marks Directory Table */}
      <div className="glass-card table-section-card">
        <div className="table-filters-bar">
          <h3>Student Directory</h3>
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
                <th>Overall CGPA</th>
                <th>Active Arrears</th>
                <th style={{ textAlign: 'center' }}>Enter Grades</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: '20px', borderRadius: '4px' }}></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-students">No student academic records found.</td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="text-muted">{idx + 1}</td>
                    <td><span className="register-no-badge">{s.id}</span></td>
                    <td>
                      <div className="student-profile-cell">
                        <div className={`student-avatar-cell ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {s.name[0]}
                        </div>
                        <span className="font-semibold">{s.name}</span>
                      </div>
                    </td>
                    <td><span className="sem-badge-cell">{s.sem}</span></td>
                    <td>
                      <div className="att-progress-cell">
                        <span style={{ color: getCgpaColor(s.cgpa || 0), fontWeight: 700 }}>{s.cgpa || 0}</span>
                        <div className="progress-bg" style={{ width: '60px' }}>
                          <div
                            className="progress-fill"
                            style={{ width: `${((s.cgpa || 0) / 10) * 100}%`, backgroundColor: getCgpaColor(s.cgpa || 0) }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {(!s.arrears || s.arrears === 0) ? (
                        <span className="text-success font-semibold">✓ Clear</span>
                      ) : (
                        <span className="text-danger font-semibold">⚠ {s.arrears}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        title="Log/Update Marks" 
                        onClick={() => openEdit(s)}
                      >
                        <Edit2 size={14} /> Grade Student
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
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div>
                <h2>{form.name} - Marks Entry</h2>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                  Register No: {form.id} | Class: {form.sem}
                </p>
              </div>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>

            {saved && (
              <div className="modal-success-flash" style={{ marginBottom: '1rem' }}>
                <CheckCircle size={18} /> All semester marks successfully saved!
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="table-container-attendance" style={{ margin: '0', maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ minWidth: '100%', marginBottom: '1rem' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ backgroundColor: 'var(--surface-color)' }}>Subject</th>
                      <th style={{ backgroundColor: 'var(--surface-color)' }}>Internal (Max 50)</th>
                      <th style={{ backgroundColor: 'var(--surface-color)' }}>External (Max 100)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.subjects.map((sub, idx) => (
                      <tr key={idx}>
                        <td>
                          {form.availableSubjects && form.availableSubjects.length > 0 ? (
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', padding: '0.4rem 0' }}>
                              {sub.subject || 'Unknown Subject'}
                            </div>
                          ) : (
                            <div style={{ color: 'var(--danger)', fontStyle: 'italic', padding: '0.4rem 0' }}>
                              No master subjects defined
                            </div>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            required
                            disabled={!(form.availableSubjects && form.availableSubjects.length > 0)}
                            style={{ width: '80px', padding: '0.4rem' }}
                            value={sub.internal}
                            onChange={e => handleSubjectChange(idx, 'internal', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            required
                            disabled={!(form.availableSubjects && form.availableSubjects.length > 0)}
                            style={{ width: '80px', padding: '0.4rem' }}
                            value={sub.external}
                            onChange={e => handleSubjectChange(idx, 'external', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary"><Save size={16} /> Save All Marks</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffMarks;
