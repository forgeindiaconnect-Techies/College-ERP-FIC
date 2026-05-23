import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [form, setForm] = useState({ title: '', subject: '', description: '', dueDate: '' });
  const [saved, setSaved] = useState(false);

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

    // Set default form subject
    if (activeStaff.subjects && activeStaff.subjects.length > 0) {
      setForm(f => ({ ...f, subject: activeStaff.subjects[0] }));
    }

    // 2. Load assignments
    const savedAssignments = localStorage.getItem('erp_assignments');
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments));
    } else {
      localStorage.setItem('erp_assignments', JSON.stringify(MOCK_ASSIGNMENTS));
      setAssignments(MOCK_ASSIGNMENTS);
    }

    setLoading(false);
  }, [navigate]);

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
      subject: staffSession.subjects[0] || '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAssignment = {
      id: String(Date.now()),
      subject: form.subject,
      class: SUBJECT_TO_CLASS[form.subject] || 'Sem 3',
      title: form.title,
      description: form.description,
      dueDate: form.dueDate,
      submissionsCount: 0,
      faculty: staffName
    };

    const updated = [newAssignment, ...assignments];
    setAssignments(updated);
    localStorage.setItem('erp_assignments', JSON.stringify(updated));

    setSaved(true);
    setTimeout(() => {
      closeModal();
      setSaved(false);
    }, 800);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this assignment posting?')) {
      const updated = assignments.filter(a => a.id !== id);
      setAssignments(updated);
      localStorage.setItem('erp_assignments', JSON.stringify(updated));
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
          <button className="btn-back" onClick={() => navigate('/staff/dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
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
              <div key={a.id} className="glass-card assignment-card">
                <div className="assignment-card-header">
                  <span className="assignment-class-badge">{staffDept} - {a.class}</span>
                  <button className="btn-delete-assignment" title="Remove Assignment" onClick={() => handleDelete(a.id)}>
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
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
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
                <label>Select Course / Subject</label>
                <select
                  value={form.subject}
                  onChange={e => handleInputChange('subject', e.target.value)}
                  required
                >
                  {staffSession.subjects.map(sub => (
                    <option key={sub} value={sub}>{sub} ({SUBJECT_TO_CLASS[sub] || 'Sem 3'})</option>
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
    </div>
  );
};

export default StaffAssignments;
