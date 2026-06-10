import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, BookOpen, User, Hash, Percent, Award, Clock } from 'lucide-react';
import { getStaff, getDepartments } from '../../api/index';
import './SubjectsManagement.css';

const DEFAULT_SUBJECTS = [
  { id: 'SUB001', code: 'CS301', name: 'Data Structures', dept: 'Computer Science Engineering', sem: 'Sem 3', teacher: 'Dr. Ananya Rao', credits: 4, workload: 4 },
  { id: 'SUB002', code: 'CS302', name: 'DBMS', dept: 'Computer Science Engineering', sem: 'Sem 3', teacher: 'Dr. Ananya Rao', credits: 4, workload: 4 },
  { id: 'SUB003', code: 'CS401', name: 'Operating Systems', dept: 'Computer Science Engineering', sem: 'Sem 4', teacher: 'Prof. Karthik S.', credits: 4, workload: 4 },
  { id: 'SUB004', code: 'CS501', name: 'Machine Learning', dept: 'Computer Science Engineering', sem: 'Sem 5', teacher: 'Prof. Karthik S.', credits: 3, workload: 3 },
  { id: 'SUB005', code: 'EE201', name: 'Circuits & Networks', dept: 'Electrical & Electronics Engineering', sem: 'Sem 2', teacher: 'Prof. Rajan Iyer', credits: 4, workload: 4 },
  { id: 'SUB006', code: 'ME301', name: 'Thermodynamics', dept: 'Mechanical Engineering', sem: 'Sem 3', teacher: 'Dr. Priya Nair', credits: 4, workload: 4 },
  { id: 'SUB007', code: 'AI101', name: 'Introduction to AI', dept: 'Artificial Intelligence & Data Science', sem: 'Sem 1', teacher: 'KARTHIK', credits: 4, workload: 4 },
  { id: 'SUB008', code: 'AI102', name: 'Python Programming', dept: 'Artificial Intelligence & Data Science', sem: 'Sem 1', teacher: 'KARTHIK', credits: 3, workload: 4 }
];

const DEPARTMENTS = [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Artificial Intelligence & Machine Learning',
  'Cyber Security',
  'Biomedical Engineering',
  'Aeronautical Engineering',
  'Automobile Engineering',
  'Robotics Engineering',
  'Chemical Engineering',
  'Biotechnology Engineering'
];
const SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

const SubjectsManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', dept: 'Computer Science Engineering', sem: 'Sem 1', teacher: '', credits: 4, workload: 4 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const staffRes = await getStaff().catch(() => ({ data: [] }));
      setStaff(staffRes?.data || []);
      
      const saved = localStorage.getItem('erp_subjects');
      if (saved) {
        let parsed = JSON.parse(saved);
        // Force inject the AI subjects if they are missing so Karthik can test it without resetting localstorage
        if (!parsed.find(s => s.code === 'AI101')) {
          parsed = [...parsed, ...DEFAULT_SUBJECTS.slice(6)];
          localStorage.setItem('erp_subjects', JSON.stringify(parsed));
        }
        setSubjects(parsed);
      } else {
        localStorage.setItem('erp_subjects', JSON.stringify(DEFAULT_SUBJECTS));
        setSubjects(DEFAULT_SUBJECTS);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveSubjects = (newList) => {
    setSubjects(newList);
    localStorage.setItem('erp_subjects', JSON.stringify(newList));
  };

  const openAdd = () => {
    setForm({ code: '', name: '', dept: 'Computer Science Engineering', sem: 'Sem 1', teacher: staff[0]?.name || '', credits: 4, workload: 4 });
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (sub) => {
    setForm({ code: sub.code, name: sub.name, dept: sub.dept, sem: sub.sem, teacher: sub.teacher, credits: sub.credits, workload: sub.workload });
    setEditTarget(sub.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTarget) {
      const updated = subjects.map(s => s.id === editTarget ? { ...s, ...form, credits: Number(form.credits), workload: Number(form.workload) } : s);
      saveSubjects(updated);
    } else {
      const newId = `SUB${String(subjects.length + 1).padStart(3, '0')}`;
      const newSub = { id: newId, ...form, credits: Number(form.credits), workload: Number(form.workload) };
      saveSubjects([...subjects, newSub]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this subject record?')) {
      const updated = subjects.filter(s => s.id !== id);
      saveSubjects(updated);
    }
  };

  const filtered = subjects.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.teacher.toLowerCase().includes(q);
    
    let sDept = s.dept;
    if (sDept === 'Computer Science') sDept = 'Computer Science Engineering';
    else if (sDept === 'Electronics & Comm.') sDept = 'Electronics & Communication Engineering';
    else if (sDept === 'Electrical Engg.') sDept = 'Electrical & Electronics Engineering';
    else if (sDept === 'Mechanical Engg.') sDept = 'Mechanical Engineering';
    else if (sDept === 'Civil Engg.') sDept = 'Civil Engineering';
    else if (sDept === 'Information Tech.') sDept = 'Information Technology';

    const matchesDept = deptFilter === 'All' || sDept === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="subjects-management animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Subjects Curriculum Management</h1>
          <p className="text-muted">Configure academic courses, assign credits weighting, and allocate teaching faculty workloads.</p>
        </div>
        <button className="btn-primary shadow-glow" onClick={openAdd}><Plus size={18} /> Add Subject</button>
      </div>

      <div className="sm-summary-row" style={{ marginTop: '1.5rem' }}>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Total Subjects</span>
          <span className="sm-summary-value">{subjects.length}</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Total Credits Mapped</span>
          <span className="sm-summary-value text-success">{subjects.reduce((sum, s) => sum + s.credits, 0)}</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Total Teaching Hours</span>
          <span className="sm-summary-value gradient-text">{subjects.reduce((sum, s) => sum + s.workload, 0)}h / wk</span>
        </div>
      </div>

      <div className="glass-card table-wrapper" style={{ marginTop: '1.5rem' }}>
        <div className="filters-row">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search by course code, title, or instructor..." 
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
                <th>Course Code</th>
                <th>Subject Name</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Allocated Faculty</th>
                <th>Credits</th>
                <th>Weekly Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: '16px', borderRadius: '4px' }}></div></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted" style={{ padding: '2rem' }}>
                    No subjects found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id}>
                    <td><span className="subject-code-pill">{sub.code}</span></td>
                    <td className="font-semibold">{sub.name}</td>
                    <td>
                      <span className="text-muted">
                        {(() => {
                          let d = sub.dept;
                          if (d === 'Computer Science') d = 'Computer Science Engineering';
                          else if (d === 'Electronics & Comm.') d = 'Electronics & Communication Engineering';
                          else if (d === 'Electrical Engg.') d = 'Electrical & Electronics Engineering';
                          else if (d === 'Mechanical Engg.') d = 'Mechanical Engineering';
                          else if (d === 'Civil Engg.') d = 'Civil Engineering';
                          else if (d === 'Information Tech.') d = 'Information Technology';
                          return d;
                        })()}
                      </span>
                    </td>
                    <td><span className="badge-outline">{sub.sem}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} className="text-muted" />
                        <span className="text-sm font-semibold">{sub.teacher || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td><span className="subject-credit-badge">{sub.credits} Credits</span></td>
                    <td><span className="subject-workload-badge">{sub.workload} Hrs</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => openEdit(sub)}><Edit2 size={15} /></button>
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(sub.id)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && <div className="table-footer">Showing {filtered.length} of {subjects.length} courses</div>}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Subject Curriculum' : 'Add Subject'}</h2>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label><Hash size={13} style={{ display: 'inline', marginRight: '4px' }} /> Course Code *</label>
                  <input required placeholder="e.g. CS301" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                </div>
                
                <div className="form-group">
                  <label><BookOpen size={13} style={{ display: 'inline', marginRight: '4px' }} /> Course Title *</label>
                  <input required placeholder="e.g. Data Structures" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Department Scope *</label>
                  <select value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Academic Semester *</label>
                  <select value={form.sem} onChange={e => setForm({ ...form, sem: e.target.value })}>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label><User size={13} style={{ display: 'inline', marginRight: '4px' }} /> Assign Instructor</label>
                  <select value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })}>
                    <option value="">— Select Instructor —</option>
                    {staff.map(f => (
                      <option key={f.id} value={f.name}>{f.name} ({f.dept})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label><Award size={13} style={{ display: 'inline', marginRight: '4px' }} /> Credits Weight</label>
                  <input type="number" min="1" max="6" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} />
                </div>

                <div className="form-group">
                  <label><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} /> Workload Weekly Hours</label>
                  <input type="number" min="1" max="10" value={form.workload} onChange={e => setForm({ ...form, workload: e.target.value })} />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editTarget ? 'Save Changes' : 'Create Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsManagement;
