import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, X, Hash, Clock, Award, User } from 'lucide-react';
import './HodSubjects.css';

const getHodSession = () => {
  try { return JSON.parse(sessionStorage.getItem('hod_session')) || { dept: 'Computer Science' }; }
  catch { return { dept: 'Computer Science' }; }
};

const SEMESTERS = ['Semester 1','Semester 2','Semester 3','Semester 4','Semester 5','Semester 6','Semester 7','Semester 8'];

const DEPT_SUBJECTS = {
  'Computer Science': ['Data Structures', 'DBMS', 'OS', 'Machine Learning', 'Computer Networks'],
  'Electronics & Comm.': ['Signals & Systems', 'Microprocessors', 'VLSI Design', 'Digital Electronics'],
  'Electrical & Electronics': ['Circuits', 'Networks', 'Power Systems', 'Control Systems'],
  'Mechanical Engg.': ['Thermodynamics', 'Fluid Mechanics', 'Heat Transfer', 'Kinematics'],
  'Cyber Security': ['Network Security', 'Cryptography', 'Ethical Hacking', 'Cyber Forensics'],
  'Artificial Intelligence & Data Science': ['Machine Learning', 'Deep Learning', 'Data Mining', 'Big Data'],
  'Bachelor of Computer App.': ['C Programming', 'Java', 'Web Technologies', 'Software Engineering'],
  'Master of Business Admin.': ['Marketing Management', 'Financial Accounting', 'HR Management', 'Business Analytics']
};

const HodSubjects = () => {
  const hod = getHodSession();
  const DEPT = hod.dept;

  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const [semFilter, setSemFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ code:'', name:'', sem:'Semester 1', teacher:'', credits:4, hours:4 });

  useEffect(() => {
    const saved = localStorage.getItem('erp_subjects');
    let existingAll = saved ? JSON.parse(saved) : [];
    const deptSubs = existingAll.filter(s => s.dept === DEPT);
    
    if (deptSubs.length > 0) {
      setSubjects(deptSubs);
    } else {
      // Auto-inject mock subjects based on department role
      const mockNames = DEPT_SUBJECTS[DEPT] || ['General Course 1', 'General Course 2'];
      const autoMocks = mockNames.map((name, i) => ({
        id: `SUB_${DEPT.substring(0,3).toUpperCase()}_${Date.now()}_${i}`,
        code: `${DEPT.substring(0,2).toUpperCase()}${300 + i}`,
        name: name,
        sem: SEMESTERS[i % SEMESTERS.length],
        teacher: 'Unassigned',
        credits: 4,
        hours: 4,
        dept: DEPT
      }));
      setSubjects(autoMocks);
      
      // Save these injected subjects to local storage immediately
      const otherDeptSubjects = existingAll.filter(s => s.dept !== DEPT);
      localStorage.setItem('erp_subjects', JSON.stringify([...otherDeptSubjects, ...autoMocks]));
    }
  }, [DEPT]);

  const save = (list) => { 
    setSubjects(list); 
    // Also save all subjects (including other departments) back to local storage
    const existing = JSON.parse(localStorage.getItem('erp_subjects') || '[]');
    // Filter out current dept subjects and merge the updated list
    const otherDeptSubjects = existing.filter(s => s.dept !== DEPT);
    localStorage.setItem('erp_subjects', JSON.stringify([...otherDeptSubjects, ...list]));
  };

  const openAdd = () => { setForm({ code:'', name:'', sem:'Semester 1', teacher:'', credits:4, hours:4 }); setEditId(null); setModalOpen(true); };
  const openEdit = (s) => { setForm({ code:s.code, name:s.name, sem:s.sem, teacher:s.teacher, credits:s.credits, hours:s.hours }); setEditId(s.id); setModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      save(subjects.map(s => s.id === editId ? { ...s, ...form, credits: Number(form.credits), hours: Number(form.hours) } : s));
    } else {
      const newId = `SUB${String(subjects.length + 1).padStart(3,'0')}`;
      save([...subjects, { id: newId, dept: DEPT, ...form, credits: Number(form.credits), hours: Number(form.hours) }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this subject?')) save(subjects.filter(s => s.id !== id));
  };

  const filtered = subjects.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.teacher.toLowerCase().includes(q))
      && (semFilter === 'All' || s.sem === semFilter);
  });

  return (
    <div className="hod-subjects-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Subjects — {DEPT}</h1>
          <p className="text-muted">Manage department course catalogue, credits, and faculty allocation.</p>
        </div>
        <button className="btn-primary shadow-glow" onClick={openAdd}><Plus size={16}/> Add Subject</button>
      </div>

      <div className="sm-summary-row" style={{ marginTop:'1.5rem' }}>
        <div className="sm-summary-card glass-card"><span className="sm-summary-label">Total Courses</span><span className="sm-summary-value">{subjects.length}</span></div>
        <div className="sm-summary-card glass-card"><span className="sm-summary-label">Total Credits</span><span className="sm-summary-value text-success">{subjects.reduce((a,s)=>a+s.credits,0)}</span></div>
        <div className="sm-summary-card glass-card"><span className="sm-summary-label">Weekly Hours</span><span className="sm-summary-value gradient-text">{subjects.reduce((a,s)=>a+s.hours,0)}h</span></div>
      </div>

      <div className="glass-card table-wrapper" style={{ marginTop:'1.5rem' }}>
        <div className="filters-row">
          <div className="search-box"><Search size={16} className="text-muted"/><input placeholder="Search by code, name or instructor..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="filter-group">
            <select className="filter-select" value={semFilter} onChange={e=>setSemFilter(e.target.value)}>
              <option value="All">All Semesters</option>
              {SEMESTERS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Code</th><th>Subject Name</th><th>Semester</th><th>Instructor</th><th>Credits</th><th>Hrs/Wk</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={7} className="text-center text-muted" style={{padding:'2rem'}}>No subjects found.</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="subject-code-pill">{s.code}</span></td>
                  <td className="font-semibold">{s.name}</td>
                  <td><span className="badge-outline">{s.sem}</span></td>
                  <td><div style={{display:'flex',alignItems:'center',gap:6}}><User size={13} className="text-muted"/><span className="text-sm font-semibold">{s.teacher||'Unassigned'}</span></div></td>
                  <td><span className="credit-badge">{s.credits} Cr</span></td>
                  <td><span className="hours-badge">{s.hours}h</span></td>
                  <td><div className="action-buttons"><button className="btn-icon" onClick={()=>openEdit(s)}><Edit2 size={14}/></button><button className="btn-icon btn-icon-danger" onClick={()=>handleDelete(s.id)}><Trash2 size={14}/></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing {filtered.length} of {subjects.length} subjects</div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={()=>setModalOpen(false)}>
          <div className="modal-card glass-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>{editId?'Edit Subject':'Add Subject'}</h2><button className="btn-icon" onClick={()=>setModalOpen(false)}><X size={18}/></button></div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group"><label><Hash size={12} style={{display:'inline',marginRight:4}}/>Course Code *</label><input required placeholder="e.g. CS301" value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/></div>
                <div className="form-group"><label><BookOpen size={12} style={{display:'inline',marginRight:4}}/>Subject Name *</label><input required placeholder="e.g. Data Structures" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                <div className="form-group"><label>Semester</label><select value={form.sem} onChange={e=>setForm({...form,sem:e.target.value})}>{SEMESTERS.map(s=><option key={s}>{s}</option>)}</select></div>
                <div className="form-group"><label><User size={12} style={{display:'inline',marginRight:4}}/>Instructor</label><input placeholder="Faculty name" value={form.teacher} onChange={e=>setForm({...form,teacher:e.target.value})}/></div>
                <div className="form-group"><label><Award size={12} style={{display:'inline',marginRight:4}}/>Credits</label><input type="number" min={1} max={6} value={form.credits} onChange={e=>setForm({...form,credits:e.target.value})}/></div>
                <div className="form-group"><label><Clock size={12} style={{display:'inline',marginRight:4}}/>Weekly Hours</label><input type="number" min={1} max={10} value={form.hours} onChange={e=>setForm({...form,hours:e.target.value})}/></div>
              </div>
              <div className="modal-actions"><button type="button" className="btn-ghost" onClick={()=>setModalOpen(false)}>Cancel</button><button type="submit" className="btn-primary">{editId?'Save Changes':'Add Subject'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HodSubjects;
