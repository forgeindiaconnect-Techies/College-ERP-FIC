import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, GraduationCap, Mail, Phone } from 'lucide-react';
import './HodManagement.css';

const DEFAULT_HODS = [
  { id: 'HOD001', name: 'Dr. Ananya Rao', email: 'csehod@gmail.com', phone: '9876543210', dept: 'Computer Science', deptCode: 'CSE', status: 'Active' },
  { id: 'HOD002', name: 'Prof. Rajan Iyer', email: 'ecehod@gmail.com', phone: '9845123456', dept: 'Electronics & Comm.', deptCode: 'ECE', status: 'Active' },
  { id: 'HOD003', name: 'Dr. Meena Pillai', email: 'mechhod@gmail.com', phone: '9812987654', dept: 'Mechanical Engg.', deptCode: 'MECH', status: 'Active' },
  { id: 'HOD004', name: 'Dr. Shalini Nair', email: 'eeehod@gmail.com', phone: '9867123456', dept: 'Electrical & Electronics', deptCode: 'EEE', status: 'Active' },
  { id: 'HOD005', name: 'Prof. Karthik S.', email: 'bcahod@gmail.com', phone: '9823456789', dept: 'Bachelor of Computer App.', deptCode: 'BCA', status: 'Active' },
  { id: 'HOD006', name: 'Dr. Sanjay Sen', email: 'mbahod@gmail.com', phone: '9854321098', dept: 'Master of Business Admin.', deptCode: 'MBA', status: 'Active' }
];

const DEPARTMENTS = [
  { name: 'Computer Science', code: 'CSE' },
  { name: 'Electronics & Comm.', code: 'ECE' },
  { name: 'Electrical & Electronics', code: 'EEE' },
  { name: 'Mechanical Engg.', code: 'MECH' },
  { name: 'Bachelor of Computer App.', code: 'BCA' },
  { name: 'Master of Business Admin.', code: 'MBA' }
];

const EMPTY_FORM = { name: '', email: '', phone: '', dept: 'Computer Science', status: 'Active' };

const HodManagement = () => {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    const raw = localStorage.getItem('erp_hods');
    if (raw) {
      setHods(JSON.parse(raw));
    } else {
      setHods(DEFAULT_HODS);
      localStorage.setItem('erp_hods', JSON.stringify(DEFAULT_HODS));
    }
    setLoading(false);
  }, []);

  const saveHods = (newList) => {
    setHods(newList);
    localStorage.setItem('erp_hods', JSON.stringify(newList));
  };

  const filtered = hods.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase()) || 
    h.dept.toLowerCase().includes(search.toLowerCase()) ||
    h.id.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModalOpen(true); };
  const openEdit = (h) => { setForm({ ...h }); setEditTarget(h.id); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); setForm(EMPTY_FORM); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const deptInfo = DEPARTMENTS.find(d => d.name === form.dept) || { code: 'HOD' };
    
    if (editTarget) {
      const updated = hods.map(h => h.id === editTarget ? { ...h, ...form, deptCode: deptInfo.code } : h);
      saveHods(updated);
    } else {
      const newId = `HOD${String(hods.length + 1).padStart(3, '0')}`;
      const newHod = { id: newId, ...form, deptCode: deptInfo.code };
      saveHods([...hods, newHod]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this HOD record?')) {
      const updated = hods.filter(h => h.id !== id);
      saveHods(updated);
    }
  };

  return (
    <div className="hod-management-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>HOD Management</h1>
          <p className="text-muted">Manage department HOD accounts, view assigned codes, and edit credentials.</p>
        </div>
        <button className="btn-primary shadow-glow" onClick={openAdd}><Plus size={18} /> Add HOD</button>
      </div>

      {/* Summary Cards */}
      <div className="sm-summary-row" style={{ marginTop: '1.5rem' }}>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Total HODs</span>
          <span className="sm-summary-value">{hods.length}</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Active HODs</span>
          <span className="sm-summary-value text-success">{hods.filter(h => h.status === 'Active').length}</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Assigned Departments</span>
          <span className="sm-summary-value gradient-text">{new Set(hods.map(h => h.dept)).size}</span>
        </div>
        <div className="sm-summary-card glass-card">
          <span className="sm-summary-label">Inactive Roles</span>
          <span className="sm-summary-value text-danger">{hods.filter(h => h.status !== 'Active').length}</span>
        </div>
      </div>

      {/* Scoped Table View */}
      <div className="glass-card table-wrapper" style={{ marginTop: '1.5rem' }}>
        <div className="filters-row">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search by name, ID or department..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>HOD ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Code</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Status</th>
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
                    No HOD records match your query.
                  </td>
                </tr>
              ) : (
                filtered.map((hod) => (
                  <tr key={hod.id}>
                    <td><span className="roll-no">{hod.id}</span></td>
                    <td className="font-semibold">{hod.name}</td>
                    <td>{hod.dept}</td>
                    <td><span className="code-pill">{hod.deptCode}</span></td>
                    <td><span className="text-sm font-semibold">{hod.email}</span></td>
                    <td><span className="text-sm">{hod.phone || '—'}</span></td>
                    <td>
                      <span className={`status-badge ${hod.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {hod.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => openEdit(hod)}><Edit2 size={15} /></button>
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(hod.id)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && <div className="table-footer">Showing {filtered.length} of {hods.length} HOD records</div>}
      </div>

      {/* Manage HOD Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit HOD Account' : 'Register New HOD'}</h2>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    required 
                    placeholder="e.g. Dr. Ananya Rao" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email"
                    required 
                    placeholder="csehod@gmail.com" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    placeholder="e.g. 9876543210" 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select 
                    value={form.dept} 
                    onChange={e => setForm({ ...form, dept: e.target.value })}
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
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
                <button type="submit" className="btn-primary">{editTarget ? 'Save Changes' : 'Register HOD'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HodManagement;
