import React, { useState, useEffect } from 'react';
import { Check, X, Search, Calendar, User, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

const getHodSession = () => {
  try { return JSON.parse(sessionStorage.getItem('hod_session')) || { dept: 'Computer Science', name: 'HOD' }; }
  catch { return { dept: 'Computer Science', name: 'HOD' }; }
};

const DEFAULT_LEAVES = [
  { id:'LR001', name:'John Doe',       role:'Student', dept:'Computer Science', type:'Medical Leave',  startDate:'2026-05-24', endDate:'2026-05-26', reason:'Viral fever, medical certificate attached.', status:'Pending' },
  { id:'LR002', name:'Dr. Ananya Rao', role:'Staff',   dept:'Computer Science', type:'Casual Leave',   startDate:'2026-05-27', endDate:'2026-05-28', reason:'International academic conference.',           status:'Pending' },
  { id:'LR003', name:'Alice Smith',    role:'Student', dept:'Computer Science', type:'Casual Leave',   startDate:'2026-05-15', endDate:'2026-05-16', reason:'Family function.',                            status:'Approved' },
];

const TABS = ['Pending','Approved','Rejected'];

const ROLE_COLORS = { Student:'#3b82f6', Staff:'#8b5cf6' };

const HodLeaves = () => {
  const hod = getHodSession();
  const DEPT = hod.dept;

  const [leaves, setLeaves] = useState([]);
  const [tab, setTab] = useState('Pending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('erp_leave_requests');
    const all = saved ? JSON.parse(saved) : DEFAULT_LEAVES;
    // Show only leaves from HOD's dept
    const deptLeaves = all.filter(l => (l.dept === DEPT) || (!l.dept && !l.role));
    setLeaves(deptLeaves.length ? deptLeaves : DEFAULT_LEAVES);
  }, [DEPT]);

  const action = (id, status) => {
    const updated = leaves.map(l => l.id===id ? { ...l, status } : l);
    setLeaves(updated);
    // Also update shared storage
    const saved = localStorage.getItem('erp_leave_requests');
    if (saved) {
      const all = JSON.parse(saved);
      const merged = all.map(l => l.id===id ? { ...l, status } : l);
      localStorage.setItem('erp_leave_requests', JSON.stringify(merged));
    }
  };

  const filtered = leaves.filter(l => {
    const name = l.name || l.staffName || '';
    const q = search.toLowerCase();
    const status = l.status || 'Pending';
    return status === tab && (name.toLowerCase().includes(q) || (l.reason||'').toLowerCase().includes(q) || (l.type||'').toLowerCase().includes(q));
  });

  return (
    <div className="animate-fade-in" style={{ padding:'1.5rem' }}>
      <div className="page-header">
        <div><h1>Leave Approvals — {DEPT}</h1><p className="text-muted">Review and approve leave requests from department students and staff.</p></div>
      </div>

      <div className="sm-summary-row" style={{ marginTop:'1.5rem' }}>
        {TABS.map(t => (
          <div key={t} className="sm-summary-card glass-card">
            <span className="sm-summary-label">{t}</span>
            <span className={`sm-summary-value ${t==='Approved'?'text-success':t==='Rejected'?'text-muted':'text-warning-c'}`}>
              {leaves.filter(l=>(l.status||'Pending')===t).length} req.
            </span>
          </div>
        ))}
      </div>

      {/* Tab strip */}
      <div style={{ display:'flex', gap:'1rem', margin:'1.5rem 0 0', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.5rem' }}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ background:'none', border:'none', fontWeight:600, fontSize:'0.9rem', padding:'0.5rem 1rem', cursor:'pointer', color: tab===t ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab===t ? '2px solid var(--primary)' : '2px solid transparent' }}>
            {t} ({leaves.filter(l=>(l.status||'Pending')===t).length})
          </button>
        ))}
      </div>

      <div className="glass-card table-wrapper" style={{ marginTop:'1rem' }}>
        <div className="filters-row">
          <div className="search-box"><Search size={16} className="text-muted"/><input placeholder="Search applicant, category or reason..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Applicant</th><th>Role</th><th>Category</th><th>Dates</th><th>Reason</th><th>Status</th>
                {tab==='Pending' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={tab==='Pending'?7:6} className="text-center text-muted" style={{padding:'2rem'}}>No {tab.toLowerCase()} leave requests.</td></tr>
              ) : filtered.map(l => {
                const name = l.name || l.staffName || 'Unknown';
                const role = l.role || 'Student';
                const status = l.status || 'Pending';
                return (
                  <tr key={l.id}>
                    <td><div style={{display:'flex',alignItems:'center',gap:6}}><User size={14} className="text-muted"/><span className="font-semibold">{name}</span></div></td>
                    <td><span style={{fontWeight:700,fontSize:'0.75rem',padding:'0.15rem 0.45rem',borderRadius:4,background:`${ROLE_COLORS[role]||'#6366f1'}18`,color:ROLE_COLORS[role]||'#6366f1',border:`1px solid ${ROLE_COLORS[role]||'#6366f1'}40`}}>{role}</span></td>
                    <td className="font-semibold text-sm">{l.type}</td>
                    <td><div style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.8rem'}}><Calendar size={12} className="text-muted"/>{l.startDate} → {l.endDate}</div></td>
                    <td><div style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:'0.8rem'}} title={l.reason}><FileText size={12} className="text-muted" style={{display:'inline',marginRight:4}}/>{l.reason}</div></td>
                    <td>
                      <span className={`status-pill ${status.toLowerCase()}`}>
                        {status==='Approved'?<CheckCircle2 size={11} style={{display:'inline',marginRight:3}}/>:status==='Rejected'?<AlertCircle size={11} style={{display:'inline',marginRight:3}}/>:<Clock size={11} style={{display:'inline',marginRight:3}}/>}
                        {status}
                      </span>
                    </td>
                    {tab==='Pending' && (
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn-primary" style={{padding:'0.3rem 0.65rem',fontSize:'0.75rem',display:'flex',alignItems:'center',gap:3}} onClick={()=>action(l.id,'Approved')}><Check size={11}/>Approve</button>
                          <button className="btn-ghost btn-ghost-danger" style={{padding:'0.3rem 0.65rem',fontSize:'0.75rem',display:'flex',alignItems:'center',gap:3}} onClick={()=>action(l.id,'Rejected')}><X size={11}/>Reject</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HodLeaves;
