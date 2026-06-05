import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { getTimetable } from '../../api/index';

const ParentTimetable = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [childDetails, setChildDetails] = useState({ dept: 'Cyber Security', sem: 'Semester 3' });

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const PERIODS = [1, 2, 3, 4, 5, 6];
  const PERIOD_TIMES = {
    1: '09:00 AM - 10:00 AM',
    2: '10:00 AM - 11:00 AM',
    3: '11:15 AM - 12:15 PM',
    4: '01:00 PM - 02:00 PM',
    5: '02:00 PM - 03:00 PM',
    6: '03:00 PM - 04:00 PM'
  };

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const session = sessionStorage.getItem('parent_session');
        let dept = 'Cyber Security';
        let sem = 'Semester 3'; // Default fallback

        if (session) {
          const parsed = JSON.parse(session);
          if (parsed.childDept) dept = parsed.childDept;
          if (parsed.childSem) sem = parsed.childSem;
        }

        // Normalize sem
        if (sem && sem.startsWith('Sem ')) {
          sem = sem.replace('Sem ', 'Semester ');
        }

        setChildDetails({ dept, sem });

        const res = await getTimetable(dept, sem);
        if (res.data && res.data.schedule) {
          const scheduleData = res.data.schedule;
          const formatted = [];
          
          if (scheduleData.length > 0 && Array.isArray(scheduleData[0])) {
            scheduleData.forEach((daySchedule, dIdx) => {
              daySchedule.forEach((subject, tIdx) => {
                if (subject) {
                  formatted.push({
                    day: DAYS[dIdx],
                    period: tIdx + 1,
                    subject: subject
                  });
                }
              });
            });
          } else {
            scheduleData.forEach(slot => formatted.push(slot));
          }
          setSchedule(formatted);
        }
      } catch (err) {
        console.error('Failed to load parent timetable:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const getSlot = (day, period) => {
    return schedule.find(s => s.day.toLowerCase() === day.toLowerCase() && Number(s.period) === Number(period));
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
          <CalendarIcon size={24} className="text-[#3b82f6]" /> Weekly Timetable
        </h1>
        <p className="text-[var(--text-muted)] mt-1">Current class schedule for {childDetails.dept} ({childDetails.sem}).</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Loading timetable...</div>
          ) : (
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-main)]">
                  <th className="p-4 font-semibold border-r border-[var(--border-color)] flex items-center justify-center gap-2">
                    <Clock size={16} className="text-[var(--text-muted)]" /> Time
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="p-4 font-semibold border-r border-[var(--border-color)]">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(p => (
                  <tr key={p} className="border-b border-[var(--border-color)] last:border-0">
                    <td className="p-4 font-medium text-[var(--text-muted)] border-r border-[var(--border-color)] whitespace-nowrap">
                      Period {p} <br/><span className="text-xs">{PERIOD_TIMES[p]}</span>
                    </td>
                    {DAYS.map(day => {
                      const slot = getSlot(day, p);
                      return (
                        <td key={`${day}-${p}`} className="p-4 border-r border-[var(--border-color)]">
                          {slot ? (
                            <div className="flex flex-col items-center">
                              <span className="text-[var(--text-main)] font-medium">{slot.subject}</span>
                              {slot.classroom && <span className="text-xs text-[var(--text-muted)] mt-1">{slot.classroom}</span>}
                            </div>
                          ) : (
                            <span className="text-[var(--text-muted)] text-sm italic opacity-50">Free Slot</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentTimetable;
