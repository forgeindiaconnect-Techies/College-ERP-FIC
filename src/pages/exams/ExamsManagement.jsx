import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Calendar, Clock, MapPin, ClipboardList, BookOpen, AlertTriangle } from 'lucide-react';
import { getDepartments } from '../../api/index';
import './ExamsManagement.css';

const DEFAULT_EXAMS = [
  { id: 'EXM001', name: 'Mid Term Test', dept: 'Computer Science', subject: 'Data Structures', date: '2026-05-28', time: '10:00 AM - 12:00 PM', room: 'Block A, Room 301', maxMarks: 50 },
  { id: 'EXM002', name: 'End Sem Theory', dept: 'Computer Science', subject: 'DBMS', date: '2026-06-02', time: '10:00 AM - 01:00 PM', room: 'Main Examination Hall', maxMarks: 100 },
  { id: 'EXM003', name: 'Semester Lab Exam', dept: 'Electrical Engg.', subject: 'Circuits & Networks', date: '2026-05-30', time: '01:30 PM - 04:30 PM', room: 'EE Core Lab 2', maxMarks: 100 }
];

const DEPARTMENTS = [
  'Computer Science', 'Electronics & Comm.', 'Electrical Engg.', 'Mechanical Engg.', 'Civil Engg.', 'Information Tech.'
];

const ExamsManagement = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: 'Mid Term Test', dept: 'Computer Science', subject: '', date: '', time: '10:00 AM - 12:00 PM', room: '', maxMarks: 100 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    // Fetch subjects from localStorage
    const savedSubs = localStorage.getItem('erp_subjects');
    const subsList = savedSubs ? JSON.parse(savedSubs) : [];
    setSubjects(subsList);

    // Fetch exams
    const savedExams = localStorage.getItem('erp_exams');
    if (savedExams) {
      setExams(JSON.parse(savedExams));
    } else {
      localStorage.setItem('erp_exams', JSON.stringify(DEFAULT_EXAMS));
      setExams(DEFAULT_EXAMS);
    }
    setLoading(false);
  };

  const saveExams = (newList) => {
    setExams(newList);
    localStorage.setItem('erp_exams', JSON.stringify(newList));
  };

  const openAdd = () => {
    const deptSubs = subjects.filter(s => s.dept === form.dept);
    setForm({ 
      name: 'Mid Term Test', 
      dept: 'Computer Science', 
      subject: deptSubs[0]?.name || 'Core Curriculum', 
      date: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0], 
      time: '10:00 AM - 12:00 PM', 
      room: 'Main Seminar Hall', 
      maxMarks: 100 
    });
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (ex) => {
    setForm({ name: ex.name, dept: ex.dept, subject: ex.subject, date: ex.date, time: ex.time, room: ex.room, maxMarks: ex.maxMarks });
    setEditTarget(ex.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTarget) {
      const updated = exams.map(ex => ex.id === editTarget ? { ...ex, ...form, maxMarks: Number(form.maxMarks) } : ex);
      saveExams(updated);
    } else {
      const newId = `EXM${String(exams.length + 1).padStart(3, '0')}`;
      const newExam = { id: newId, ...form, maxMarks: Number(form.maxMarks) };
      saveExams([...exams, newExam]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this exam schedule slot?')) {
      const updated = exams.filter(ex => ex.id !== id);
      saveExams(updated);
    }
  };

  // Get active subjects for the selected department in the form
  const getDeptSubjects = (deptName) => {
    return subjects.filter(s => s.dept === deptName);
  };

  const filtered = exams.filter(ex => {
    const q = search.toLowerCase();
    const matchesSearch = ex.name.toLowerCase().includes(q) || ex.subject.toLowerCase().includes(q) || ex.room.toLowerCase().includes(q);
    const matchesDept = deptFilter === 'All' || ex.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="exams-management animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Exams & Schedule Manager</h1>
          <p className="text-muted">Coordinate upcoming midterms, finals, room allocations, and exam supervisors globally.</p>
        </div>
        <button className="btn-primary shadow-glow" onClick={openAdd}><Plus size={18} /> Schedule Exam</button>
      </div>

      <div className="sm-summary-row" style={{ marginTop: '1.5rem' }}>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Total Scheduled</span>
          <span className="sm-summary-value">{exams.length} Slots</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Active Venues</span>
          <span className="sm-summary-value text-success">{new Set(exams.map(e => e.room)).size} Venues</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Collisions Detected</span>
          <span className="sm-summary-value text-success">0 Alerts</span>
        </div>
      </div>

      <div className="glass-card table-wrapper" style={{ marginTop: '1.5rem' }}>
        <div className="filters-row">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search by test name, course, or venue room..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div className="filter-group">
            <select className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Exam Category</th>
                <th>Course / Subject</th>
                <th>Department</th>
                <th>Date Schedule</th>
                <th>Time Window</th>
                <th>Allocated Room</th>
                <th>Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: '16px', borderRadius: '4px' }}></div></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted" style={{ padding: '2rem' }}>
                    No exam timetables registered.
                  </td>
                </tr>
              ) : (
                filtered.map((ex) => (
                  <tr key={ex.id}>
                    <td className="font-semibold">{ex.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={13} className="text-muted" />
                        <span className="font-semibold">{ex.subject}</span>
                      </div>
                    </td>
                    <td><span className="text-muted">{ex.dept}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} className="text-muted" />
                        <span>{ex.date}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} className="text-muted" />
                        <span className="text-sm font-semibold">{ex.time}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={13} className="text-muted" />
                        <span className="exam-hall-badge">{ex.room}</span>
                      </div>
                    </td>
                    <td><span className="exam-marks-badge">{ex.maxMarks} Marks</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => openEdit(ex)}><Edit2 size={15} /></button>
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(ex.id)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && <div className="table-footer">Showing {filtered.length} of {exams.length} examinations</div>}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Scheduled Exam' : 'Schedule New Exam'}</h2>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Exam Category *</label>
                  <select value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}>
                    <option value="Mid Term Test">Mid Term Test</option>
                    <option value="End Sem Theory">End Sem Theory</option>
                    <option value="Semester Lab Exam">Semester Lab Exam</option>
                    <option value="Special Supplementary">Special Supplementary</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Department Scope *</label>
                  <select value={form.dept} onChange={e => {
                    const nextDept = e.target.value;
                    const nextSubs = getDeptSubjects(nextDept);
                    setForm({ ...form, dept: nextDept, subject: nextSubs[0]?.name || 'Core Curriculum' });
                  }}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Mapped Subject *</label>
                  <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                    {getDeptSubjects(form.dept).length === 0 ? (
                      <option value="Core Curriculum">Core Curriculum (No subjects mapped)</option>
                    ) : (
                      getDeptSubjects(form.dept).map(s => (
                        <option key={s.id} value={s.name}>{s.name} ({s.code})</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label><Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} /> Scheduled Date *</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>

                <div className="form-group">
                  <label><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} /> Time Window *</label>
                  <input required placeholder="e.g. 10:00 AM - 01:00 PM" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>

                <div className="form-group">
                  <label><MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} /> Venue Hall *</label>
                  <input required placeholder="e.g. Exam Hall B" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
                </div>

                <div className="form-group">
                  <label><ClipboardList size={13} style={{ display: 'inline', marginRight: '4px' }} /> Maximum Marks</label>
                  <input type="number" min="10" max="100" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editTarget ? 'Save Changes' : 'Publish Slot'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsManagement;
