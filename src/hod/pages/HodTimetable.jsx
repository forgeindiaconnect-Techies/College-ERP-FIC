import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, User, BookOpen, Clock, X, CheckCircle } from 'lucide-react';
import { getStaff } from '../../api/index';
import './HodTimetable.css';

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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PERIODS = [
  { id: 1, label: 'Period 1', time: '09:00 - 10:00' },
  { id: 2, label: 'Period 2', time: '10:00 - 11:00' },
  { id: 3, label: 'Period 3', time: '11:15 - 12:15' },
  { id: 4, label: 'Period 4', time: '12:15 - 01:15' },
  { id: 5, label: 'Period 5', time: '02:00 - 03:00' },
  { id: 6, label: 'Period 6', time: '03:00 - 04:00' },
];

const MOCK_TIMETABLE_FALLBACK = [
  // CS Timetable
  { id: '1', dept: 'Computer Science', day: 'Monday', period: 1, subject: 'Data Structures', faculty: 'Dr. Ananya Rao', classroom: 'LH-101' },
  { id: '2', dept: 'Computer Science', day: 'Monday', period: 3, subject: 'DBMS', faculty: 'Dr. Ananya Rao', classroom: 'LH-101' },
  { id: '3', dept: 'Computer Science', day: 'Tuesday', period: 2, subject: 'OS', faculty: 'Prof. Karthik S.', classroom: 'LH-102' },
  { id: '4', dept: 'Computer Science', day: 'Wednesday', period: 5, subject: 'Machine Learning', faculty: 'Prof. Karthik S.', classroom: 'Lab 2' },
  
  // EE Timetable
  { id: '5', dept: 'Electrical Engg.', day: 'Monday', period: 1, subject: 'Circuits', faculty: 'Prof. Rajan Iyer', classroom: 'LH-201' },
  { id: '6', dept: 'Electrical Engg.', day: 'Monday', period: 2, subject: 'Networks', faculty: 'Prof. Rajan Iyer', classroom: 'LH-201' },
  { id: '7', dept: 'Electrical Engg.', day: 'Tuesday', period: 4, subject: 'Electronics', faculty: 'Dr. Meena Pillai', classroom: 'LH-202' },
  { id: '8', dept: 'Electrical Engg.', day: 'Thursday', period: 3, subject: 'Power Systems', faculty: 'Prof. Rajan Iyer', classroom: 'EE Lab' },
];

const EMPTY_SLOT = { day: '', period: 1, subject: '', faculty: '', classroom: '' };

const HodTimetable = () => {
  const hodSession = getHodSession();
  const HOD_DEPT = hodSession.dept;

  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add
  const [form, setForm] = useState(EMPTY_SLOT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load timetable
    const savedTimetable = localStorage.getItem('erp_timetable');
    let initialTimetable = MOCK_TIMETABLE_FALLBACK;
    if (savedTimetable) {
      initialTimetable = JSON.parse(savedTimetable);
    } else {
      localStorage.setItem('erp_timetable', JSON.stringify(MOCK_TIMETABLE_FALLBACK));
    }
    setSchedule(initialTimetable);

    // Load subjects for the select dropdown
    const savedSubjects = localStorage.getItem('erp_subjects');
    if (savedSubjects) {
      const allSubs = JSON.parse(savedSubjects);
      const deptSubs = allSubs.filter(s => s.dept === HOD_DEPT).map(s => s.name);
      setSubjectList([...new Set(deptSubs)]);
    } else {
      setSubjectList([]);
    }

    // Load faculty for the select dropdown from backend
    const fetchFaculty = async () => {
      try {
        const res = await getStaff();
        const filteredStaff = (res.data || []).filter(s => s.dept === HOD_DEPT);
        
        if (filteredStaff.length > 0) {
          setFacultyList(filteredStaff.map(s => s.name));
        } else {
          setFacultyList([]);
        }
      } catch (err) {
        console.warn('Failed to load faculty', err);
        setFacultyList([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFaculty();
  }, []);

  const saveTimetable = (newSchedule) => {
    setSchedule(newSchedule);
    localStorage.setItem('erp_timetable', JSON.stringify(newSchedule));
  };

  /* Filter schedule to HOD's department */
  const deptSchedule = schedule.filter(s => s.dept === HOD_DEPT);

  // Helper to find slot in state
  const findSlot = (day, periodId) => {
    return deptSchedule.find(s => s.day === day && s.period === periodId);
  };

  const openAdd = (dayStr, periodNum) => {
    setEditTarget(null);
    setForm({ 
      ...EMPTY_SLOT, 
      day: dayStr || DAYS[0], 
      period: periodNum || 1, 
      faculty: facultyList.length > 0 ? facultyList[0] : '',
      subject: subjectList.length > 0 ? subjectList[0] : ''
    });
    setSaved(false);
    setModalOpen(true);
  };

  const openEdit = (slot) => {
    setForm({
      day: slot.day,
      period: slot.period,
      subject: slot.subject,
      faculty: slot.faculty,
      classroom: slot.classroom
    });
    setEditTarget(slot.id);
    setSaved(false);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this class slot from the timetable?')) {
      const updated = schedule.filter(s => s.id !== id);
      saveTimetable(updated);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm({ ...EMPTY_SLOT, faculty: facultyList.length > 0 ? facultyList[0] : '', subject: subjectList.length > 0 ? subjectList[0] : '' });
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let updated;
    if (editTarget) {
      updated = schedule.map(s => s.id === editTarget ? { ...s, ...form } : s);
    } else {
      // Check if slot already occupied
      const occupied = deptSchedule.some(s => s.day === form.day && s.period === +form.period);
      if (occupied) {
        alert('This time slot is already occupied!');
        return;
      }
      
      const newSlot = {
        id: String(Date.now()),
        dept: HOD_DEPT,
        ...form,
        period: +form.period
      };
      updated = [...schedule, newSlot];
    }

    saveTimetable(updated);
    setSaved(true);
    setTimeout(() => { closeModal(); setSaved(false); }, 800);
  };

  return (
    <div className="timetable-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Department Timetable</h1>
          <p className="text-muted">Review, add, or coordinate class schedules and rooms for <strong>{HOD_DEPT}</strong>.</p>
        </div>
        <button id="add-slot-btn" className="btn-primary shadow-glow" onClick={() => openAdd('', 1)}>
          <Plus size={18} /> Add Schedule Slot
        </button>
      </div>

      {/* Grid Timetable Wrapper */}
      <div className="glass-card timetable-wrapper">
        <div className="timetable-grid-container">
          <div className="timetable-grid">
            {/* Header Column/Row */}
            <div className="grid-header-corner">Day / Period</div>
            {PERIODS.map(p => (
              <div key={p.id} className="grid-header-col">
                <span className="period-title">{p.label}</span>
                <span className="period-time">{p.time}</span>
              </div>
            ))}

            {/* Days Rows */}
            {DAYS.map(day => (
              <React.Fragment key={day}>
                {/* Row Header */}
                <div className="grid-day-row-header">{day}</div>
                
                {/* Columns */}
                {PERIODS.map(p => {
                  const slot = findSlot(day, p.id);
                  return (
                    <div key={`${day}-${p.id}`} className={`grid-slot-cell ${slot ? 'occupied' : 'empty'}`}>
                      {slot ? (
                        <div className="slot-card">
                          <p className="slot-subject">{slot.subject}</p>
                          <p className="slot-detail"><User size={11} /> {slot.faculty}</p>
                          <p className="slot-detail"><MapPin size={11} /> {slot.classroom}</p>
                          
                          <div className="slot-actions">
                            <button onClick={() => openEdit(slot)} title="Edit"><Edit2 size={12} /></button>
                            <button onClick={() => handleDelete(slot.id)} title="Delete" className="delete"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ) : (
                        <button className="add-slot-hover-btn" onClick={() => openAdd(day, p.id)} title="Schedule slot">
                          <Plus size={15} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editTarget ? 'Edit Schedule Slot' : 'Add Timetable Slot'}</h2>
                <p className="text-muted" style={{fontSize: '0.85rem', marginTop: '2px'}}>Schedule class times, rooms, and assigning professors.</p>
              </div>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>

            {saved && (
              <div className="modal-success-flash" style={{display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.75rem', background: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid rgba(16,185,129,0.2)'}}>
                <CheckCircle size={18} /> Timetable slot updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label><Calendar size={13} /> Day of the Week</label>
                  <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label><Clock size={13} /> Time Period</label>
                  <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                    {PERIODS.map(p => <option key={p.id} value={p.id}>{p.label} ({p.time})</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label><BookOpen size={13} /> Subject Name *</label>
                  <select required value={form.subject || (subjectList.length > 0 ? subjectList[0] : '')} onChange={e => setForm({ ...form, subject: e.target.value })}>
                    {subjectList.length === 0 ? (
                      <option value="">No Subjects Available</option>
                    ) : (
                      subjectList.map((name, idx) => <option key={`${name}-${idx}`} value={name}>{name}</option>)
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label><User size={13} /> Assign Faculty</label>
                  <select value={form.faculty || (facultyList.length > 0 ? facultyList[0] : '')} onChange={e => setForm({ ...form, faculty: e.target.value })}>
                    {facultyList.length === 0 ? (
                      <option value="">No Faculty Available</option>
                    ) : (
                      facultyList.map(name => <option key={name} value={name}>{name}</option>)
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label><MapPin size={13} /> Classroom / Lab *</label>
                  <input required placeholder="e.g. LH-302, Micro Lab" value={form.classroom} onChange={e => setForm({ ...form, classroom: e.target.value })} />
                </div>
              </div>

              <div className="modal-actions" style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem'}}>
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" id="save-timetable-btn" className="btn-primary">Save Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HodTimetable;
