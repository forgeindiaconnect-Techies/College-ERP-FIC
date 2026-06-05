import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft, RefreshCw, User } from 'lucide-react';
import useRealtimeSync from '../../hooks/useRealtimeSync';
import './StaffTimetable.css';

// Fallback session
const DEFAULT_SESSION = {
  name: 'Dr. Ananya Rao',
  dept: 'Cyber Security',
  deptCode: 'CS',
  role: 'Staff',
  subjects: ['Data Structures', 'DBMS']
};

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6];
const PERIOD_TIMES = {
  1: '09:00 - 10:00',
  2: '10:00 - 11:00',
  3: '11:15 - 12:15',
  4: '12:15 - 01:15',
  5: '02:00 - 03:00',
  6: '03:00 - 04:00'
};

const StaffTimetable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staffSession, setStaffSession] = useState(DEFAULT_SESSION);
  const [timetable, setTimetable] = useState([]);
  const [selectedSem, setSelectedSem] = useState('Semester 6');

  const loadTimetable = React.useCallback(async () => {
    setLoading(true);
    try {
      const { getTimetable } = await import('../../api/index.js');
      const res = await getTimetable(staffSession.dept, selectedSem);
      if (res.data && res.data.schedule) {
        const scheduleData = res.data.schedule;
        const formatted = [];
        
        if (scheduleData.length > 0 && Array.isArray(scheduleData[0])) {
          // It's a 2D array (saved by Admin)
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          scheduleData.forEach((daySchedule, dIdx) => {
            daySchedule.forEach((subject, tIdx) => {
              if (subject) {
                formatted.push({
                  dept: staffSession.dept,
                  day: days[dIdx],
                  period: tIdx + 1,
                  subject: subject,
                  faculty: 'Assigned Faculty',
                  classroom: 'Main Block'
                });
              }
            });
          });
        } else {
          // It's a flat object array (saved by HOD)
          scheduleData.forEach(slot => formatted.push(slot));
        }
        
        setTimetable(formatted);
      } else {
        setTimetable([]);
      }
    } catch (err) {
      console.error('Failed to fetch staff timetable', err);
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  }, [staffSession.dept, selectedSem]);

  useEffect(() => {
    // 1. Session check
    const session = sessionStorage.getItem('staff_session');
    if (session) {
      const activeStaff = JSON.parse(session);
      setStaffSession(activeStaff);
    } else {
      navigate('/staff/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (staffSession.dept) {
      loadTimetable();
    }
  }, [staffSession.dept, loadTimetable]);

  useRealtimeSync(loadTimetable, ['timetable']);

  const staffName = staffSession.name;
  const staffDept = staffSession.dept;

  // Filter timetable slots matching staff's department (case-insensitive)
  const classSchedule = timetable.filter(s => {
    if (!s.dept || !staffDept) return false;
    return s.dept.trim().toLowerCase() === staffDept.trim().toLowerCase();
  });

  // Helper to find slot for a specific day and period
  const getSlot = (day, period) => {
    return classSchedule.find(s => s.day.toLowerCase() === day.toLowerCase() && Number(s.period) === Number(period));
  };

  return (
    <div className="timetable-management-staff animate-fade-in">
      <div className="page-header-staff">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/staff/dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1>Department Timetable</h1>
            <p className="text-muted">View the complete weekly schedule for your department.</p>
          </div>
        </div>
        <div className="header-right">
          <select 
            value={selectedSem} 
            onChange={(e) => setSelectedSem(e.target.value)}
            className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-main)] rounded px-4 py-2 outline-none focus:border-[#8b5cf6]"
          >
            <option>Semester 1</option>
            <option>Semester 2</option>
            <option>Semester 3</option>
            <option>Semester 4</option>
            <option>Semester 5</option>
            <option>Semester 6</option>
          </select>
        </div>
      </div>

      {/* Timetable Grid Card */}
      <div className="glass-card timetable-card-wrapper">
        <div className="timetable-header-row">
          <div className="timetable-legend">
            <span className="legend-item"><span className="legend-dot active"></span> Assigned Slot</span>
            <span className="legend-item"><span className="legend-dot empty"></span> Free Slot</span>
          </div>
          <p className="text-muted text-sm" style={{ margin: 0 }}>
            Timetable is maintained by your Department HOD.
          </p>
        </div>

        <div className="timetable-grid-scroll">
          <table className="timetable-table">
            <thead>
              <tr>
                <th className="day-col-header">Day / Period</th>
                {PERIODS.map(p => (
                  <th key={p}>
                    <div className="period-header">
                      <span className="period-number">Period {p}</span>
                      <span className="period-time"><Clock size={11} /> {PERIOD_TIMES[p]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                DAYS_ORDER.map(day => (
                  <tr key={day}>
                    <td className="day-name-cell">{day}</td>
                    {PERIODS.map(p => (
                      <td key={p}>
                        <div className="skeleton" style={{ height: '70px', borderRadius: '8px' }}></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                DAYS_ORDER.map(day => (
                  <tr key={day}>
                    <td className="day-name-cell">{day}</td>
                    {PERIODS.map(p => {
                      const slot = getSlot(day, p);
                      if (slot) {
                        return (
                          <td key={p}>
                            <div className={`timetable-slot active animate-scale-in ${slot.faculty === staffName ? 'my-slot' : ''}`} style={slot.faculty === staffName ? { borderLeft: '4px solid #10b981', background: 'rgba(16,185,129,0.05)' } : {}}>
                              <p className="slot-subject">{slot.subject}</p>
                              <p className="slot-class" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: slot.faculty === staffName ? '#10b981' : 'var(--text-muted)' }}>
                                <User size={11} /> {slot.faculty || 'Unknown Faculty'}
                              </p>
                              <p className="slot-classroom"><MapPin size={11} /> {slot.classroom || 'Room 302'}</p>
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={p}>
                          <div className="timetable-slot empty">
                            <span className="empty-text">Free Period</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffTimetable;
