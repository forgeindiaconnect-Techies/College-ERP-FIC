import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignments, createAssignment, getAssignmentSubmissions, getStudents } from '../../api/index';
import {
  ClipboardList, Plus, Search, Calendar, Users, FileText,
  Trash2, X, CheckCircle, ArrowLeft, AlertCircle, BookOpen
} from 'lucide-react';
import './StaffAssignments.css';

// Fallback session
const DEFAULT_SESSION = {
  name: 'Dr. Ananya Rao',
  dept: 'Computer Science',
  deptCode: 'CS',
  role: 'Staff',
  subjects: ['Data Structures', 'DBMS']
};

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

const MOCK_ASSIGNMENTS = [
  { id: '1', subject: 'Data Structures', class: 'Sem 3', title: 'Implement Binary Search Tree', description: 'Write a Java program to implement a BST with insert, delete, and search operations.', dueDate: '2026-05-28', submissionsCount: 12, faculty: 'Dr. Ananya Rao' },
  { id: '2', subject: 'DBMS', class: 'Sem 6', title: 'SQL Join Queries Practice', description: 'Complete the SQL exercises sheet on nested queries and multi-table joins.', dueDate: '2026-05-25', submissionsCount: 8, faculty: 'Dr. Ananya Rao' }
];

const StaffAssignments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staffSession, setStaffSession] = useState(DEFAULT_SESSION);

  // Assignments state
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState('');

  // Modal create states
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', targetClass: 'Sem 1', description: '', dueDate: '' });
  const [saved, setSaved] = useState(false);

  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);

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
    const savedSubjects = localStorage.getItem(`erp_subjects_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`);
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
      dynSubjects = activeStaff.subjects && activeStaff.subjects.length > 0 ? activeStaff.subjects : [];
      if (dynSubjects.length === 0) {
        const fallback = DEPT_SUBJECTS[activeStaff.dept] || DEPT_SUBJECTS[activeStaff.dept + ' Engineering'] || [];
        dynSubjects = fallback;
      }
    }

    if (dynSubjects.length === 0) {
      dynSubjects = ['No Subjects Assigned'];
    }
    
    setAvailableSubjects(dynSubjects);
    setForm(f => ({ ...f, subject: dynSubjects[0] || '' }));

    fetchAssignments(activeStaff.name);
  }, [navigate]);

  const fetchAssignments = async (facultyName) => {
    try {
      setLoading(true);
      const res = await getAssignments();
      setAssignments(res.data.filter(a => a.faculty === facultyName));
    } catch (err) {
      console.warn('Failed to fetch assignments, using fallback mock data');
    } finally {
      setLoading(false);
    }
  };

  const staffName = staffSession.name;
  const staffDept = staffSession.dept;

  // Filter assignments created by this staff member
  const myAssignments = assignments.filter(a => a.faculty === staffName);

  const filteredAssignments = myAssignments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase())
  );


  const openAdd = () => {
    setForm({
      title: '',
      subject: availableSubjects[0] || '',
      targetClass: 'Sem 1',
      description: '',
      dueDate: ''
    });
    setSaved(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newAssignment = {
      subject: form.subject,
      class: form.targetClass,
      title: form.title,
      description: form.description,
      dueDate: form.dueDate,
      department: staffDept,
      faculty: staffName
    };

    try {
      const res = await createAssignment(newAssignment);
      setAssignments([res.data, ...assignments]);
      setSaved(true);
      setTimeout(() => {
        closeModal();
        setSaved(false);
      }, 800);
    } catch (err) {
      console.error('Error creating assignment:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
      }
      alert('Error creating assignment: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
    }
  };

  const openSubmissions = async (assignment) => {
    setViewingAssignment(assignment);
    setSubmissionsModalOpen(true);
    setSubsLoading(true);
    try {
      // 1. Get submissions for this assignment
      const subRes = await getAssignmentSubmissions(assignment._id || assignment.id);
      setAssignmentSubmissions(subRes.data || []);
      
      // 2. Get all students in this department and class to find pending
      const stuRes = await getStudents();
      const allStuds = stuRes.data || [];
      const targetStudents = allStuds.filter(s => 
        (s.dept === assignment.department || s.department === assignment.department) && 
        (s.sem === assignment.class || s.semester === assignment.class)
      );
      setClassStudents(targetStudents);
    } catch (err) {
      console.error(err);
    } finally {
      setSubsLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this assignment posting?')) {
      const updated = assignments.filter(a => a.id !== id);
      setAssignments(updated);
      localStorage.setItem(`erp_assignments_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`, JSON.stringify(updated));
    }
  };

  // Helper to determine days left
  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    return `${diffDays} days left`;
  };

  return (
    <div className="assignments-management-staff animate-fade-in">
      <div className="page-header-staff">
        <div className="header-left">
          
          <div>
            <h1>Assignments Coordinator</h1>
            <p className="text-muted">Post coursework, set deadlines, and manage student homework folders.</p>
          </div>
        </div>

        <button className="btn-primary shadow-glow" onClick={openAdd}>
          <Plus size={18} /> New Assignment
        </button>
      </div>

      {/* Filters Search Bar */}
      <div className="glass-card search-card-assignments">
        <div className="table-filters-bar" style={{ borderBottom: 'none', padding: '1rem 1.5rem' }}>
          <div className="search-box-attendance" style={{ width: '100%' }}>
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search assignments by subject, title, details..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid of assignments */}
      <div className="assignments-grid">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="glass-card assignment-skeleton-card">
              <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '1rem' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '0.6rem' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '1rem' }}></div>
              <div className="skeleton" style={{ height: '36px', width: '100%' }}></div>
            </div>
          ))
        ) : filteredAssignments.length === 0 ? (
          <div className="glass-card no-assignments-banner col-span-full">
            <ClipboardList size={40} className="text-muted" style={{ marginBottom: '1rem' }} />
            <h3>No Assignments Given</h3>
            <p className="text-muted">You haven't posted any assignments yet. Click "New Assignment" to post one.</p>
          </div>
        ) : (
          filteredAssignments.map(a => {
            const daysLeftStr = getDaysLeft(a.dueDate);
            const isOverdue = daysLeftStr === 'Overdue';
            const isDueToday = daysLeftStr === 'Due Today';

            return (
              <div key={a._id || a.id} className="glass-card assignment-card" onClick={() => openSubmissions(a)} style={{ cursor: 'pointer' }}>
                <div className="assignment-card-header">
                  <span className="assignment-class-badge">{staffDept} - {a.class}</span>
                  <button className="btn-delete-assignment" title="Remove Assignment" onClick={(e) => { e.stopPropagation(); handleDelete(a._id || a.id); }}>
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="assignment-card-body">
                  <h3 className="assignment-title">{a.title}</h3>
                  <p className="assignment-subject-tag"><BookOpen size={13} /> {a.subject}</p>
                  <p className="assignment-desc">"{a.description}"</p>
                </div>

                <div className="assignment-card-footer">
                  <div className="assignment-meta-item">
                    <Calendar size={14} className="meta-icon" />
                    <span>Due: <strong>{a.dueDate}</strong></span>
                  </div>

                  <div className="assignment-meta-item">
                    <Users size={14} className="meta-icon" />
                    <span>Submissions: <strong>{a.submissionsCount}</strong></span>
                  </div>

                  <div className={`assignment-deadline-badge ${isOverdue ? 'overdue' : isDueToday ? 'today' : 'active'}`}>
                    {daysLeftStr}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NEW ASSIGNMENT MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <h2>Create New Assignment</h2>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                  Assign homework tasks or mini-projects to your student classes.
                </p>
              </div>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>

            {saved && (
              <div className="modal-success-flash">
                <CheckCircle size={18} /> Assignment posted and notified successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Target Class / Semester</label>
                <select
                  value={form.targetClass}
                  onChange={e => handleInputChange('targetClass', e.target.value)}
                  required
                >
                  {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map(sem => (
                    <option key={sem} value={sem}>{staffDept} - {sem}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Course / Subject</label>
                <select
                  value={form.subject}
                  onChange={e => handleInputChange('subject', e.target.value)}
                  required
                >
                  {availableSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binary Search Tree Implementation"
                  value={form.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Submission Deadline</label>
                <input
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={e => handleInputChange('dueDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Assignment Guidelines / Details</label>
                <textarea
                  required
                  placeholder="Write clear instructions, submission criteria, and rules..."
                  rows="4"
                  value={form.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Post Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {submissionsModalOpen && viewingAssignment && (
        <div className="modal-overlay" onClick={() => setSubmissionsModalOpen(false)}>
          <div className="modal-card glass-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Submissions: {viewingAssignment.title}</h2>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{viewingAssignment.department} - {viewingAssignment.class}</p>
              </div>
              <button className="btn-icon" onClick={() => setSubmissionsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {subsLoading ? (
                <p>Loading submissions...</p>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="stat-box" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                      <h4>Total Students</h4>
                      <h2>{classStudents.length}</h2>
                    </div>
                    <div className="stat-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                      <h4>Submitted</h4>
                      <h2>{assignmentSubmissions.length}</h2>
                    </div>
                    <div className="stat-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                      <h4>Pending</h4>
                      <h2>{Math.max(0, classStudents.length - assignmentSubmissions.length)}</h2>
                    </div>
                  </div>
                  
                  <h4>Student List</h4>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                    {classStudents.length === 0 ? (
                      <li className="text-muted">No students found in this class.</li>
                    ) : (
                      classStudents.map(student => {
                        const hasSubmitted = assignmentSubmissions.some(sub => sub.studentId === student.referenceId || sub.studentId === student.id || sub.studentId === student._id);
                        return (
                          <li key={student._id || student.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                            <span>{student.name} ({student.rollNo || student.id})</span>
                            <span style={{ 
                              color: hasSubmitted ? '#10b981' : '#ef4444',
                              fontWeight: 'bold',
                              fontSize: '0.85rem'
                            }}>
                              {hasSubmitted ? '✓ Submitted' : 'Pending'}
                            </span>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAssignments;
