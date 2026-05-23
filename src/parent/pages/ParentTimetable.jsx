import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const ParentTimetable = () => {
  const schedule = [
    { time: '09:00 AM - 10:00 AM', mon: 'CS301 (Lab)', tue: 'CS302', wed: 'CS303', thu: 'CS304', fri: 'CS301' },
    { time: '10:00 AM - 11:00 AM', mon: 'CS301 (Lab)', tue: 'CS303', wed: 'CS302', thu: 'CS301', fri: 'CS304' },
    { time: '11:15 AM - 12:15 PM', mon: 'CS304', tue: 'CS301', wed: 'CS304', thu: 'CS303', fri: 'CS302' },
    { time: '01:00 PM - 02:00 PM', mon: 'Lunch', tue: 'Lunch', wed: 'Lunch', thu: 'Lunch', fri: 'Lunch' },
    { time: '02:00 PM - 04:00 PM', mon: 'CS302 (Lab)', tue: 'Project', wed: 'Library', thu: 'CS303 (Lab)', fri: 'Sports' },
  ];

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
          <CalendarIcon size={24} className="text-[#3b82f6]" /> Weekly Timetable
        </h1>
        <p className="text-[var(--text-muted)] mt-1">Current class schedule for Semester 6.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-main)]">
                <th className="p-4 font-semibold border-r border-[var(--border-color)] flex items-center justify-center gap-2">
                  <Clock size={16} className="text-[var(--text-muted)]" /> Time
                </th>
                <th className="p-4 font-semibold border-r border-[var(--border-color)]">Monday</th>
                <th className="p-4 font-semibold border-r border-[var(--border-color)]">Tuesday</th>
                <th className="p-4 font-semibold border-r border-[var(--border-color)]">Wednesday</th>
                <th className="p-4 font-semibold border-r border-[var(--border-color)]">Thursday</th>
                <th className="p-4 font-semibold">Friday</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border-color)] last:border-0">
                  <td className="p-4 font-medium text-[var(--text-muted)] border-r border-[var(--border-color)] whitespace-nowrap">
                    {row.time}
                  </td>
                  <td className={`p-4 border-r border-[var(--border-color)] ${row.mon === 'Lunch' ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] font-medium italic' : 'text-[var(--text-main)] font-medium hover:bg-[#3b82f6]/10 transition-colors'}`}>{row.mon}</td>
                  <td className={`p-4 border-r border-[var(--border-color)] ${row.tue === 'Lunch' ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] font-medium italic' : 'text-[var(--text-main)] font-medium hover:bg-[#3b82f6]/10 transition-colors'}`}>{row.tue}</td>
                  <td className={`p-4 border-r border-[var(--border-color)] ${row.wed === 'Lunch' ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] font-medium italic' : 'text-[var(--text-main)] font-medium hover:bg-[#3b82f6]/10 transition-colors'}`}>{row.wed}</td>
                  <td className={`p-4 border-r border-[var(--border-color)] ${row.thu === 'Lunch' ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] font-medium italic' : 'text-[var(--text-main)] font-medium hover:bg-[#3b82f6]/10 transition-colors'}`}>{row.thu}</td>
                  <td className={`p-4 ${row.fri === 'Lunch' ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] font-medium italic' : 'text-[var(--text-main)] font-medium hover:bg-[#3b82f6]/10 transition-colors'}`}>{row.fri}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentTimetable;
