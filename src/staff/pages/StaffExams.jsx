import React, { useState, useEffect } from 'react';
import { Calendar, Search, MapPin, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { getExams } from '../../api/index';

const getStaffSession = () => {
  try { return JSON.parse(sessionStorage.getItem('staff_session')) || { dept: 'Computer Science' }; }
  catch { return { dept: 'Computer Science' }; }
};

const StaffExams = () => {
  const staff = getStaffSession();
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [staff.dept]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await getExams();
      if (res?.data) {
        // filter by staff's department name
        const filtered = res.data.filter(e => e.dept?.toLowerCase() === staff.dept?.toLowerCase());
        setExams(filtered);
      }
    } catch (err) {
      console.warn('API error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = exams.filter(ex => {
    const q = search.toLowerCase();
    return ex.name.toLowerCase().includes(q) || ex.subject.toLowerCase().includes(q) || ex.room.toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-in" style={{ padding:'1.5rem' }}>
      <div className="page-header">
        <div><h1>Department Exam Schedule</h1><p className="text-muted">View scheduled examination slots and venues for your department.</p></div>
      </div>

      <div className="sm-summary-row" style={{ marginTop:'1.5rem' }}>
        <div className="sm-summary-card glass-card"><span className="sm-summary-label">Scheduled Exams</span><span className="sm-summary-value">{exams.length}</span></div>
        <div className="sm-summary-card glass-card"><span className="sm-summary-label">Unique Venues</span><span className="sm-summary-value text-success">{new Set(exams.map(e=>e.room).filter(Boolean)).size}</span></div>
        <div className="sm-summary-card glass-card"><span className="sm-summary-label">Upcoming (Next 7d)</span><span className="sm-summary-value gradient-text">{exams.filter(e=>{const d=new Date(e.date);const n=new Date();return d>=n && d<=new Date(n.getTime()+7*86400000);}).length}</span></div>
      </div>

      <div className="glass-card table-wrapper" style={{ marginTop:'1.5rem' }}>
        <div className="filters-row">
          <div className="search-box"><Search size={16} className="text-muted"/><input placeholder="Search by exam, subject or room..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Exam Type</th><th>Subject</th><th>Semester</th><th>Date</th><th>Time</th><th>Venue</th><th>Marks</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-muted" style={{padding:'2rem'}}>Loading exam schedules...</td></tr>
              ) : filtered.length===0 ? (
                <tr><td colSpan={7} className="text-center text-muted" style={{padding:'2rem'}}>No exams scheduled yet.</td></tr>
              ) : filtered.map(ex => (
                <tr key={ex._id || ex.id}>
                  <td className="font-semibold">
                    <div style={{display:'flex',alignItems:'center',gap:5}}><GraduationCap size={15} className="text-primary"/><span>{ex.name}</span></div>
                  </td>
                  <td><div style={{display:'flex',alignItems:'center',gap:5}}><BookOpen size={13} className="text-muted"/><span>{ex.subject}</span></div></td>
                  <td><span className="badge-outline">{ex.sem}</span></td>
                  <td><div style={{display:'flex',alignItems:'center',gap:5}}><Calendar size={13} className="text-muted"/><span className="text-sm">{ex.date}</span></div></td>
                  <td><div style={{display:'flex',alignItems:'center',gap:5}}><Clock size={13} className="text-muted"/><span className="text-sm font-semibold">{ex.time}</span></div></td>
                  <td><div style={{display:'flex',alignItems:'center',gap:5}}><MapPin size={13} className="text-muted"/><span style={{background:'rgba(59,130,246,0.1)',color:'#3b82f6',padding:'0.15rem 0.45rem',borderRadius:4,fontSize:'0.78rem',fontWeight:700}}>{ex.room}</span></div></td>
                  <td><span style={{background:'rgba(236,72,153,0.1)',color:'#ec4899',padding:'0.15rem 0.45rem',borderRadius:4,fontSize:'0.78rem',fontWeight:700}}>{ex.maxMarks} Marks</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffExams;
