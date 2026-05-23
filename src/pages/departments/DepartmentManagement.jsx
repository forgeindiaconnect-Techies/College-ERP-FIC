import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, Building2, Users, UserCircle, ArrowRight } from 'lucide-react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/index';
import './DepartmentManagement.css';

const MOCK_DEPARTMENTS = [
  { id: 'DEPT01', name: 'Computer Science', code: 'CS', hod: 'Dr. Ananya Rao', students: 420, staff: 28, established: 1998, status: 'Active' },
  { id: 'DEPT02', name: 'Electrical Engg.', code: 'EE', hod: 'Prof. Rajan Iyer', students: 380, staff: 22, established: 1990, status: 'Active' },
  { id: 'DEPT03', name: 'Mechanical Engg.', code: 'ME', hod: 'Dr. Meena Pillai', students: 360, staff: 20, established: 1985, status: 'Active' },
  { id: 'DEPT04', name: 'Civil Engg.', code: 'CE', hod: 'Dr. Shalini Nair', students: 290, staff: 18, established: 1988, status: 'Inactive' },
  { id: 'DEPT05', name: 'Information Tech.', code: 'IT', hod: 'Prof. Karthik S.', students: 340, staff: 19, established: 2001, status: 'Active' },
];

const HOD_OPTIONS = ['Dr. Ananya Rao', 'Prof. Rajan Iyer', 'Dr. Meena Pillai', 'Dr. Shalini Nair', 'Prof. Karthik S.'];
const EMPTY_FORM = { name: '', code: '', hod: '', students: '', staff: '', established: '2020', status: 'Active' };

const DepartmentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [depts, setDepts] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await getDepartments();
      setDepts(res.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      // Fallback
      setDepts(MOCK_DEPARTMENTS);
    } finally {
      setLoading(false);
    }
  };

  const filtered = depts.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModalOpen(true); };
  const openEdit = (d) => { setForm({ ...d }); setEditTarget(d.id); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); setForm(EMPTY_FORM); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTarget) {
        const payload = { ...form, students: Number(form.students), staff: Number(form.staff) };
        await updateDepartment(editTarget, payload);
        setDepts(prev => prev.map(d => d.id === editTarget ? { ...d, ...payload } : d));
      } else {
        const newId = `DEPT${String(depts.length + 1).padStart(2, '0')}`;
        const payload = { 
          id: newId, 
          ...form, 
          students: Number(form.students) || 0, 
          staff: Number(form.staff) || 0 
        };
        const res = await createDepartment(payload);
        setDepts(prev => [...prev, res.data]);
      }
      closeModal();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save department. Ensure backend is running.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this department? This action cannot be undone.')) {
      try {
        await deleteDepartment(id);
        setDepts(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete department.');
      }
    }
  };

  return (
    <div className="dept-management animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Department Management</h1>
          <p className="text-muted">Manage academic departments, assign HODs, and track capacity metrics.</p>
        </div>
        <button className="btn-primary shadow-glow" onClick={openAdd}><Plus size={18} /> Add Department</button>
      </div>

      {/* Summary Row */}
      <div className="sm-summary-row">
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Total Departments</span>
          <span className="sm-summary-value">{depts.length}</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Total Students Enrolled</span>
          <span className="sm-summary-value gradient-text">{depts.reduce((a, b) => a + Number(b.students), 0).toLocaleString()}</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Total Faculty Members</span>
          <span className="sm-summary-value text-success">{depts.reduce((a, b) => a + Number(b.staff), 0)}</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Active Departments</span>
          <span className="sm-summary-value text-primary">{depts.filter(d => d.status === 'Active').length}</span>
        </div>
      </div>

      {/* Cards Section */}
      <div className="dept-cards-wrapper">
        <div className="filters-row mb-4">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search departments..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {loading ? (
          <div className="dept-cards-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="dept-card glass-card skeleton-card" style={{ height: '220px' }}></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card text-center text-muted" style={{ padding: '3rem' }}>
            No departments match your query.
          </div>
        ) : (
          <div className="dept-cards-grid">
            {filtered.map(dept => (
              <div key={dept.id} className="dept-card glass-card">
                <div className="dept-card-header">
                  <div className="dept-title-area">
                    <div className="dept-icon-box"><Building2 size={24} className="text-primary" /></div>
                    <div>
                      <h3 className="dept-name">{dept.name}</h3>
                      <span className="dept-code">{dept.code}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${dept.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                    {dept.status || 'Active'}
                  </span>
                </div>

                <div className="dept-card-body">
                  <div className="dept-hod-info">
                    <UserCircle size={18} className="text-muted" />
                    <span className="hod-name">{dept.hod ? dept.hod : <span className="text-danger">No HOD Assigned</span>}</span>
                  </div>
                  
                  <div className="dept-stats-row">
                    <div className="dept-stat-box">
                      <span className="stat-label">Students</span>
                      <span className="stat-number">{Number(dept.students).toLocaleString()}</span>
                    </div>
                    <div className="dept-stat-box">
                      <span className="stat-label">Staff</span>
                      <span className="stat-number">{dept.staff}</span>
                    </div>
                  </div>
                </div>

                <div className="dept-actions">
                  <button 
                    className="btn-outline flex-1" 
                    onClick={() => navigate(`/admin/departments/${dept._id || dept.id}`)}
                  >
                    View Details <ArrowRight size={16} />
                  </button>
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => openEdit(dept)} title="Edit"><Edit2 size={16} /></button>
                    <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(dept.id)} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Department' : 'Add New Department'}</h2>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Department Name</label>
                  <input 
                    required 
                    placeholder="e.g. Computer Science" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Department Code</label>
                  <input 
                    required 
                    placeholder="e.g. CS" 
                    value={form.code} 
                    onChange={e => setForm({ ...form, code: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Assign HOD</label>
                  <select 
                    required 
                    value={form.hod} 
                    onChange={e => setForm({ ...form, hod: e.target.value })}
                  >
                    <option value="">Select HOD</option>
                    {HOD_OPTIONS.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year Established</label>
                  <input 
                    type="number" 
                    min="1900" 
                    max="2026" 
                    placeholder="e.g. 1998" 
                    value={form.established} 
                    onChange={e => setForm({ ...form, established: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Total Students</label>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="e.g. 420" 
                    value={form.students} 
                    onChange={e => setForm({ ...form, students: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Total Staff</label>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="e.g. 28" 
                    value={form.staff} 
                    onChange={e => setForm({ ...form, staff: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={form.status} 
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editTarget ? 'Save Changes' : 'Add Department'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
