import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Save, Plus, CheckCircle, X } from 'lucide-react';
import { getTimetable, publishTimetable, getDepartments } from '../api/index';

const DEFAULT_DEPARTMENTS = [
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

const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

const TimetableManagement = () => {
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [dept, setDept] = useState('Computer Science Engineering');
  const [sem, setSem] = useState('Semester 6');
  const [times, setTimes] = useState(['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '01:00 - 02:00', '02:00 - 04:00']);
  const [grid, setGrid] = useState([
    ['', '', '', 'Lunch', ''],
    ['', '', '', 'Lunch', ''],
    ['', '', '', 'Lunch', ''],
    ['', '', '', 'Lunch', ''],
    ['', '', '', 'Lunch', '']
  ]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Custom Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newTime, setNewTime] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    const savedDepts = localStorage.getItem('erp_departments');
    if (savedDepts) {
      const parsed = JSON.parse(savedDepts);
      // Merge unique departments so cached old arrays don't overwrite new defaults
      setDepartments([...new Set([...DEFAULT_DEPARTMENTS, ...parsed])]);
    } else {
      setDepartments(DEFAULT_DEPARTMENTS);
    }
    fetchData();
  }, [dept, sem]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTimetable(dept, sem);
      if (res.data) {
        setTimes(res.data.times || ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '01:00 - 02:00', '02:00 - 04:00']);
        setGrid(res.data.schedule || [
          ['', '', '', 'Lunch', ''],
          ['', '', '', 'Lunch', ''],
          ['', '', '', 'Lunch', ''],
          ['', '', '', 'Lunch', ''],
          ['', '', '', 'Lunch', '']
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch timetable', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (dayIndex, timeIndex, value) => {
    const newGrid = [...grid];
    if (!newGrid[dayIndex]) newGrid[dayIndex] = [];
    while (newGrid[dayIndex].length <= timeIndex) {
      newGrid[dayIndex].push('');
    }
    newGrid[dayIndex][timeIndex] = value;
    setGrid(newGrid);
  };

  const handleAddTimeslot = () => {
    setNewTime('');
    setModalOpen(true);
  };

  const confirmAddTimeslot = (e) => {
    e.preventDefault();
    if (newTime.trim()) {
      setTimes([...times, newTime.trim()]);
      setGrid(grid.map(day => [...day, '']));
    }
    setModalOpen(false);
  };

  const handlePublish = async () => {
    try {
      await publishTimetable({ department: dept, semester: sem, times, schedule: grid });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to publish timetable', err);
      alert('Failed to publish timetable');
    }
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <Calendar size={24} className="text-[#6366F1]" /> Timetable Management
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Configure weekly schedules for all departments and semesters. <strong>Click inside any cell below to type a subject!</strong></p>
        </div>
        <div className="flex gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-[#059669] font-medium mr-2">
              <CheckCircle size={18} /> Saved!
            </div>
          )}
          <button onClick={handleAddTimeslot} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Timeslot
          </button>
          <button onClick={handlePublish} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> Publish
          </button>
        </div>
      </div>

      <div className="glass-card p-4 mb-6 flex flex-wrap gap-4 items-center bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[var(--text-muted)]" />
          <span className="text-[var(--text-main)] font-medium">Filter Schedule:</span>
        </div>
        <select 
          className="bg-transparent border border-[var(--border-color)] text-[var(--text-main)] rounded px-3 py-1.5 outline-none focus:border-[#6366F1]"
          value={dept} onChange={e => setDept(e.target.value)}
        >
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select 
          className="bg-transparent border border-[var(--border-color)] text-[var(--text-main)] rounded px-3 py-1.5 outline-none focus:border-[#6366F1]"
          value={sem} onChange={e => setSem(e.target.value)}
        >
          {SEMESTERS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, borderRight: '1px solid var(--border-color)' }}>Day / Time</th>
                  {times.map(t => (
                    <th key={t} style={{ padding: '1rem', fontWeight: 600, borderRight: '1px solid var(--border-color)' }}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, dIdx) => (
                  <tr key={day} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)', borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                      {day}
                    </td>
                    {times.map((_, tIdx) => {
                      const cellValue = grid[dIdx]?.[tIdx] || '';
                      const isLunch = cellValue === 'Lunch';
                      return (
                        <td key={tIdx} style={{ padding: '0.5rem', borderRight: '1px solid var(--border-color)', background: isLunch ? 'var(--bg-secondary)' : 'transparent' }}>
                          <input 
                            type="text" 
                            value={cellValue}
                            onChange={(e) => handleCellChange(dIdx, tIdx, e.target.value)}
                            placeholder={isLunch ? '' : '+ Add Subject'}
                            style={{
                              width: '100%',
                              textAlign: 'center',
                              outline: 'none',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              background: isLunch ? 'transparent' : 'var(--bg-primary)',
                              border: isLunch ? 'none' : '1px solid var(--border-color)',
                              color: isLunch ? 'var(--text-muted)' : 'var(--text-main)',
                              fontStyle: isLunch ? 'italic' : 'normal',
                              fontWeight: 500,
                              transition: 'border-color 0.2s'
                            }}
                            readOnly={isLunch}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Add Timeslot</h2>
                <p className="text-muted" style={{fontSize: '0.85rem', marginTop: '2px'}}>Enter the duration for the new timeslot.</p>
              </div>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={confirmAddTimeslot} className="modal-form">
              <div className="form-group">
                <label>Timeslot Duration (e.g. 04:00 - 05:00)</label>
                <input required autoFocus value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="04:00 - 05:00" />
              </div>
              <div className="modal-actions" style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem'}}>
                <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Timeslot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableManagement;
