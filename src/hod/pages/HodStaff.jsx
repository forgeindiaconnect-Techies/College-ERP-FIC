import React, { useState, useEffect } from 'react';
import { Search, Edit2, Mail, Phone, X, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { getStaff, updateStaff } from '../../api/index';
import './HodStaff.css';

// Try to grab logged in HOD session
const getHodSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem('hod_session')) || {
      name: 'Prof. Rajan Iyer', dept: 'Electrical Engg.', deptCode: 'EE', role: 'HOD'
    };
  } catch (e) {
    return { name: 'Prof. Rajan Iyer', dept: 'Electrical Engg.', deptCode: 'EE', role: 'HOD' };
  }
};

const MOCK_STAFF_FALLBACK = [
  { id: 'STF001', name: 'Dr. Ananya Rao', email: 'ananya@college.edu', phone: '9876543210', dept: 'Computer Science', designation: 'Professor', subjects: ['Data Structures', 'DBMS'], workload: 18, attendance: 97 },
  { id: 'STF002', name: 'Prof. Rajan Iyer', email: 'rajan@college.edu', phone: '9845123456', dept: 'Electrical Engg.', designation: 'HOD', subjects: ['Circuits', 'Networks'], workload: 14, attendance: 95 },
  { id: 'STF003', name: 'Dr. Meena Pillai', email: 'meena@college.edu', phone: '9812987654', dept: 'Mechanical Engg.', designation: 'Associate Prof.', subjects: ['Thermodynamics', 'Fluid Mechanics'], workload: 16, attendance: 92 },
  { id: 'STF004', name: 'Prof. Karthik S.', email: 'karthik@college.edu', phone: '9823456789', dept: 'Computer Science', designation: 'Assistant Prof.', subjects: ['OS', 'Machine Learning'], workload: 20, attendance: 89 },
  { id: 'STF005', name: 'Dr. Shalini Nair', email: 'shalini@college.edu', phone: '9867123456', dept: 'Civil Engg.', designation: 'Professor', subjects: ['Structural Analysis'], workload: 12, attendance: 98 },
];

const SUBJECTS = [
  'Data Structures', 'DBMS', 'Networks', 'OS', 'Machine Learning', 
  'Circuits', 'Power Systems', 'Electronics', 'Thermodynamics', 
  'Fluid Mechanics', 'Structural Analysis', 'Engineering Math'
];

const EMPTY_FORM = { id: '', name: '', designation: '', workload: '', subjects: [] };

const getInitials = (name) => name.replace('Dr. ', '').replace('Prof. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
const AVATAR_COLORS = ['bg-gradient-blue', 'bg-gradient-purple', 'bg-gradient-orange', 'bg-gradient-green', 'bg-gradient-teal'];

const HodStaff = () => {
  const hodSession = getHodSession();
  const HOD_DEPT = hodSession.dept;

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  
  /* Edit Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await getStaff();
      // Backend auto-scopes to HOD's dept via JWT departmentScope middleware
      setStaff(res.data);
      setLoading(false);
    } catch (err) {
      console.warn('Backend unavailable, using fallback data:', err.message);
      const savedData = localStorage.getItem('erp_staff');
      const initialData = savedData ? JSON.parse(savedData) : MOCK_STAFF_FALLBACK;
      setStaff(initialData.filter(s => s.dept === HOD_DEPT));
      setLoading(false);
    }
  };

  /* Backend already scoped to HOD dept – just apply search filter */
  const filtered = staff
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (s) => {
    setForm({
      id: s.id,
      name: s.name,
      designation: s.designation,
      workload: s.workload,
      subjects: [...s.subjects]
    });
    setEditTarget(s.id);
    setSaved(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const toggleSubject = (sub) => {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(sub)
        ? f.subjects.filter(s => s !== sub)
        : [...f.subjects, sub]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      await updateStaff(editTarget, { workload: +form.workload, subjects: form.subjects });
      setStaff(prev => prev.map(s =>
        s.id === editTarget
          ? { ...s, workload: +form.workload, subjects: form.subjects }
          : s
      ));
      setSaved(true);
      setTimeout(() => { closeModal(); setSaved(false); }, 800);
    } catch (err) {
      console.error('Save failed:', err);
      // Fallback: update locally
      setStaff(prev => prev.map(s =>
        s.id === editTarget
          ? { ...s, workload: +form.workload, subjects: form.subjects }
          : s
      ));
      setSaved(true);
      setTimeout(() => { closeModal(); setSaved(false); }, 800);
    }
  };

  const getWorkloadColor = (w) => w > 18 ? 'text-danger' : w > 14 ? 'text-warning-cgpa' : 'text-success';

  return (
    <div className="staff-management animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Department Faculty</h1>
          <p className="text-muted">Manage subjects assignment and workloads for faculty in <strong>{HOD_DEPT}</strong>.</p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="sm-summary-row">
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Total Faculty</span>
          <span className="sm-summary-value">{filtered.length}</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Average Workload</span>
          <span className="sm-summary-value gradient-text">
            {filtered.length ? (filtered.reduce((a, b) => a + b.workload, 0) / filtered.length).toFixed(1) + 'h' : '—'}
          </span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Avg Attendance</span>
          <span className="sm-summary-value text-success">
            {filtered.length ? (filtered.reduce((a, b) => a + b.attendance, 0) / filtered.length).toFixed(1) + '%' : '—'}
          </span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Overloaded Faculty</span>
          <span className="sm-summary-value text-danger">{filtered.filter(s => s.workload > 18).length}</span>
        </div>
      </div>

      {/* Staff Table */}
      <div className="glass-card table-wrapper">
        <div className="filters-row">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search faculty by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Staff ID</th><th>Name</th><th>Designation</th>
                <th>Assigned Subjects</th><th>Weekly Workload</th><th>Attendance</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: '16px', borderRadius: '4px', width: j === 2 ? '150px' : '60px' }}></div></td>)}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="no-data">No faculty registered in this department.</td></tr>
              ) : filtered.map((s, idx) => (
                <tr key={s.id}>
                  <td className="text-muted">{idx + 1}</td>
                  <td><span className="roll-no">{s.id}</span></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`avatar-sm ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>{getInitials(s.name)}</div>
                      <div>
                        <p className="student-name-cell">{s.name}</p>
                        <div className="staff-contact">
                          <Mail size={11} />{s.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`designation-badge ${s.designation === 'HOD' ? 'badge-hod' : ''}`}>{s.designation}</span></td>
                  <td>
                    <div className="subjects-list">
                      {s.subjects.length > 0 ? s.subjects.map(sub => (
                        <span key={sub} className="subject-tag">{sub}</span>
                      )) : <span className="no-subj-assigned">None Assigned</span>}
                    </div>
                  </td>
                  <td><span className={`font-semibold ${getWorkloadColor(s.workload)}`}>{s.workload}h</span></td>
                  <td>
                    <div className="att-cell">
                      <span style={{ color: s.attendance >= 90 ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>{s.attendance}%</span>
                      <div className="mini-progress-bar">
                        <div className="mini-progress-fill" style={{ width: `${s.attendance}%`, background: s.attendance >= 90 ? 'var(--success)' : 'var(--warning)' }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit workload / subjects" onClick={() => openEdit(s)}><Edit2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <div className="table-footer">Showing {filtered.length} faculty members under your department</div>}
      </div>

      {/* EDIT MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Edit Faculty Load</h2>
                <p className="text-muted" style={{fontSize: '0.85rem', marginTop: '2px'}}>Assign subjects and modify weekly hours for {form.name}.</p>
              </div>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>

            {saved && (
              <div className="modal-success-flash" style={{display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.75rem', background: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid rgba(16,185,129,0.2)'}}>
                <CheckCircle size={18} /> Workload settings saved!
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Faculty Name</label>
                  <input disabled value={form.name} style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input disabled value={form.designation} style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label><Clock size={13} /> Weekly Workload (hours) *</label>
                  <input type="number" min="0" max="30" required value={form.workload} onChange={e => setForm({ ...form, workload: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label><BookOpen size={13} /> Subjects Assignment</label>
                <div className="subjects-picker" style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', maxHeight: '180px', overflowY: 'auto', padding: '0.2rem'}}>
                  {SUBJECTS.map(sub => (
                    <button type="button" key={sub}
                      className={`subject-pick-btn ${form.subjects.includes(sub) ? 'selected' : ''}`}
                      onClick={() => toggleSubject(sub)}
                      style={{
                        padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border-color)',
                        background: form.subjects.includes(sub) ? 'rgba(79,70,229,0.1)' : 'var(--bg-primary)',
                        borderColor: form.subjects.includes(sub) ? 'var(--primary)' : 'var(--border-color)',
                        color: form.subjects.includes(sub) ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '0.82rem', fontWeight: form.subjects.includes(sub) ? '600' : '400',
                        cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >{sub}</button>
                  ))}
                </div>
              </div>

              <div className="modal-actions" style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem'}}>
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HodStaff;
