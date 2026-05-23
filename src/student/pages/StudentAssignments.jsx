import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Calendar, Users, X, CheckCircle, FileText, ArrowLeft, UploadCloud } from 'lucide-react';
import './StudentAssignments.css';

// Fallbacks
const DEFAULT_STUDENT = {
  id: 'CS2022001',
  name: 'John Doe',
  dept: 'Computer Science',
  sem: 'Sem 6',
  email: 'john@college.edu'
};

const StudentAssignments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentSession, setStudentSession] = useState(DEFAULT_STUDENT);
  const [assignments, setAssignments] = useState([]);

  // Submission popup state
  const [submitOpen, setSubmitOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [fileName, setFileName] = useState('');
  const [submittedTasks, setSubmittedTasks] = useState({});
  const [success, setSuccess] = useState(false);

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

    // 2. Load assignments matching this student's class semester (e.g. Sem 6)
    const savedAssignments = localStorage.getItem('erp_assignments');
    let filtered = [];
    if (savedAssignments) {
      filtered = JSON.parse(savedAssignments).filter(a =>
        a.class.toLowerCase() === activeStud.sem.toLowerCase()
      );
    } else {
      // Fallback
      filtered = [
        { id: '2', subject: 'DBMS', class: 'Sem 6', title: 'SQL Join Queries Practice', description: 'Complete the SQL exercises sheet on nested queries and multi-table joins.', dueDate: '2026-05-25', submissionsCount: 8, faculty: 'Dr. Ananya Rao' }
      ];
    }
    setAssignments(filtered);

    // Load any submitted states from localStorage for persistence
    const savedSubmissions = localStorage.getItem(`erp_student_submissions_${activeStud.id}`);
    if (savedSubmissions) {
      setSubmittedTasks(JSON.parse(savedSubmissions));
    }

    setLoading(false);
  }, [navigate]);

  const openSubmit = (task) => {
    setActiveTask(task);
    setFileName('');
    setSuccess(false);
    setSubmitOpen(true);
  };

  const closeSubmit = () => {
    setSubmitOpen(false);
    setActiveTask(null);
  };

  const handleMockSubmit = (e) => {
    e.preventDefault();
    if (!activeTask) return;

    const newSubmissions = {
      ...submittedTasks,
      [activeTask.id]: {
        fileName: fileName || 'assignment_submission.pdf',
        submittedAt: new Date().toISOString().split('T')[0]
      }
    };

    setSubmittedTasks(newSubmissions);
    localStorage.setItem(`erp_student_submissions_${studentSession.id}`, JSON.stringify(newSubmissions));

    setSuccess(true);
    setTimeout(() => {
      closeSubmit();
      setSuccess(false);
    }, 800);
  };

  return (
    <div className="student-assignments-page animate-fade-in">
      <div className="page-header-student">
        <div className="header-left-s">
          <button className="btn-back-s" onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1>Course Assignments</h1>
            <p className="text-muted">Stay up to date with tasks assigned by your instructors and upload submissions.</p>
          </div>
        </div>
      </div>

      <div className="student-assignments-grid">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="glass-card assignment-skeleton-card">
              <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '1rem' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '0.6rem' }}></div>
              <div className="skeleton" style={{ height: '36px', width: '100%' }}></div>
            </div>
          ))
        ) : assignments.length === 0 ? (
          <div className="glass-card no-assignments-banner-s col-span-full">
            <ClipboardList size={40} className="text-muted" style={{ marginBottom: '1rem' }} />
            <h3>No Pending Assignments</h3>
            <p className="text-muted">Your semester courses do not have active homework tasks assigned.</p>
          </div>
        ) : (
          assignments.map(a => {
            const isSubmitted = !!submittedTasks[a.id];
            const subData = submittedTasks[a.id];

            return (
              <div key={a.id} className="glass-card s-assignment-card">
                <div className="s-assignment-header">
                  <span className="subject-code-tag">{a.subject}</span>
                  <span className={`status-pill ${isSubmitted ? 'submitted' : 'pending'}`}>
                    {isSubmitted ? '✓ Submitted' : 'Pending Submission'}
                  </span>
                </div>

                <div className="s-assignment-body">
                  <h3>{a.title}</h3>
                  <p className="instructor-label">Instructor: <strong>{a.faculty}</strong></p>
                  <p className="guideline-text">"{a.description}"</p>
                </div>

                <div className="s-assignment-footer">
                  <div className="footer-details-row">
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Due Date: <strong>{a.dueDate}</strong></span>
                    </div>
                  </div>

                  {isSubmitted ? (
                    <div className="submitted-file-info">
                      <FileText size={13} />
                      <span>{subData.fileName}</span>
                    </div>
                  ) : (
                    <button className="btn-submit-task" onClick={() => openSubmit(a)}>
                      <UploadCloud size={14} /> Submit Task
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mock Submit Dialog */}
      {submitOpen && (
        <div className="modal-overlay" onClick={closeSubmit}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Upload Coursework</h2>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{activeTask?.title}</p>
              </div>
              <button className="btn-icon" onClick={closeSubmit}><X size={20} /></button>
            </div>

            {success && (
              <div className="modal-success-flash">
                <CheckCircle size={18} /> Assignment submitted successfully!
              </div>
            )}

            <form onSubmit={handleMockSubmit} className="modal-form">
              <div className="form-group">
                <label>File Upload (Simulated)</label>
                <div className="mock-upload-zone">
                  <UploadCloud size={32} className="text-primary-s" />
                  <p className="text-sm text-muted">Click or drag a file to this zone to upload</p>
                  <input
                    type="text"
                    required
                    placeholder="e.g. dbms_assignment_john.pdf"
                    value={fileName}
                    onChange={e => setFileName(e.target.value)}
                    style={{ background: 'var(--bg-secondary)', marginTop: '0.5rem', textAlign: 'center' }}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeSubmit}>Cancel</button>
                <button type="submit" className="btn-primary">Upload File</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
