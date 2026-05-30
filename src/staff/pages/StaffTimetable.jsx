import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft, RefreshCw } from 'lucide-react';
import './StaffTimetable.css';

// Fallback session
const DEFAULT_SESSION = {
  name: 'Dr. Ananya Rao',
  dept: 'Computer Science',
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

  useEffect(() => {
    // 1. Session check
    const session = sessionStorage.getItem('staff_session');
    let activeStaff = DEFAULT_SESSION;
    if (session) {
      activeStaff = JSON.parse(session);
      setStaffSession(activeStaff);
    } else {
      navigate('/staff/login');
      return;
    }

    // 2. Load timetable database
    const savedTimetable = localStorage.getItem('erp_timetable');
    if (savedTimetable) {
      setTimetable(JSON.parse(savedTimetable));
    }
    setLoading(false);
  }, [navigate]);

  const staffName = staffSession.name;
  const staffDept = staffSession.dept;

  // Filter timetable slots assigned to this staff member's department
  const mySchedule = timetable.filter(s => s.dept === staffDept);

  // Helper to find slot for a specific day and period
  const getSlot = (day, period) => {
    return mySchedule.find(s => s.day.toLowerCase() === day.toLowerCase() && Number(s.period) === Number(period));
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
                            <div className="timetable-slot active animate-scale-in">
                              <p className="slot-subject">{slot.subject}</p>
                              <p className="slot-class">{slot.dept} - Sem {slot.id ? '6' : '3'}</p>
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
