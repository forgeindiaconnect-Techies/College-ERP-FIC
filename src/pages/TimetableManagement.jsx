import React, { useState } from 'react';
import { Calendar, Filter, Save, Plus } from 'lucide-react';

const TimetableManagement = () => {
  const [dept, setDept] = useState('Computer Science');
  const [sem, setSem] = useState('Semester 6');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '01:00 - 02:00', '02:00 - 04:00'];

  // A simple grid representing the timetable state
  const [grid, setGrid] = useState([
    ['CS301', 'CS302', 'CS304', 'Lunch', 'CS302 (Lab)'],
    ['CS301 (Lab)', 'CS303', 'CS301', 'Lunch', 'Project'],
    ['CS303', 'CS302', 'CS304', 'Lunch', 'Library'],
    ['CS304', 'CS301', 'CS303', 'Lunch', 'CS303 (Lab)'],
    ['CS301', 'CS304', 'CS302', 'Lunch', 'Sports'],
  ]);

  const handleCellChange = (dayIndex, timeIndex, value) => {
    const newGrid = [...grid];
    newGrid[dayIndex][timeIndex] = value;
    setGrid(newGrid);
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <Calendar size={24} className="text-[#8b5cf6]" /> Timetable Management
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Configure weekly schedules for all departments and semesters.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] font-medium rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <Plus size={18} /> Add Timeslot
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-[#8b5cf6] text-white font-medium rounded-lg hover:bg-purple-600 shadow-lg transition-all">
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
          className="bg-transparent border border-[var(--border-color)] text-[var(--text-main)] rounded px-3 py-1.5 outline-none focus:border-[#8b5cf6]"
          value={dept} onChange={e => setDept(e.target.value)}
        >
          <option>Computer Science</option>
          <option>Electrical Engg.</option>
          <option>Mechanical Engg.</option>
        </select>
        <select 
          className="bg-transparent border border-[var(--border-color)] text-[var(--text-main)] rounded px-3 py-1.5 outline-none focus:border-[#8b5cf6]"
          value={sem} onChange={e => setSem(e.target.value)}
        >
          <option>Semester 1</option>
          <option>Semester 2</option>
          <option>Semester 6</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-main)]">
                <th className="p-4 font-semibold border-r border-[var(--border-color)]">Day / Time</th>
                {times.map(t => (
                  <th key={t} className="p-4 font-semibold border-r border-[var(--border-color)] last:border-0">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dIdx) => (
                <tr key={day} className="border-b border-[var(--border-color)] last:border-0">
                  <td className="p-4 font-bold text-[var(--text-main)] border-r border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    {day}
                  </td>
                  {times.map((_, tIdx) => (
                    <td key={tIdx} className={`p-2 border-r border-[var(--border-color)] last:border-0 ${grid[dIdx][tIdx] === 'Lunch' ? 'bg-[var(--bg-secondary)]' : ''}`}>
                      <input 
                        type="text" 
                        value={grid[dIdx][tIdx]}
                        onChange={(e) => handleCellChange(dIdx, tIdx, e.target.value)}
                        className={`w-full text-center bg-transparent border-none outline-none ${grid[dIdx][tIdx] === 'Lunch' ? 'text-[var(--text-muted)] italic font-medium' : 'text-[var(--text-main)] font-medium hover:bg-[var(--hover-bg)] py-2 rounded transition-colors cursor-pointer'}`}
                        readOnly={grid[dIdx][tIdx] === 'Lunch'}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimetableManagement;
