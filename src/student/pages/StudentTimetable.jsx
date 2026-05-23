import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import './StudentTimetable.css';

// Fallbacks
const DEFAULT_STUDENT = {
  id: 'CS2022001',
  name: 'John Doe',
  dept: 'Computer Science',
  sem: 'Sem 6',
  email: 'john@college.edu'
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

const StudentTimetable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentSession, setStudentSession] = useState(DEFAULT_STUDENT);
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    // 1. Session check
    const session = sessionStorage.getItem('student_session');
    let activeStud = DEFAULT_STUDENT;
    if (session) {
      activeStud = JSON.parse(session);
      setStudentSession(activeStud);
    } else {
      navigate('/student/login');
      return;
    }

    // 2. Load timetable database
    const savedTimetable = localStorage.getItem('erp_timetable');
    if (savedTimetable) {
      setTimetable(JSON.parse(savedTimetable));
    }
    setLoading(false);
  }, [navigate]);

  const studentDept = studentSession.dept;

  // Filter timetable slots matching student's department
  const classSchedule = timetable.filter(s => s.dept === studentDept);

  // Helper to find slot for a specific day and period
  const getSlot = (day, period) => {
    return classSchedule.find(s => s.day.toLowerCase() === day.toLowerCase() && Number(s.period) === Number(period));
  };

  return (
    <div className="student-timetable-page animate-fade-in">
      <div className="page-header-student">
        <div className="header-left-s">
          <button className="btn-back-s" onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1>Class Timetable</h1>
            <p className="text-muted">View your weekly lecture schedule, timings, and assigned lecture halls.</p>
          </div>
        </div>
      </div>

      {/* Timetable Grid Card */}
      <div className="glass-card timetable-card-wrapper-s">
        <div className="timetable-header-row-s">
          <div className="timetable-legend-s">
            <span className="legend-item-s"><span className="legend-dot-s active"></span> Scheduled Lecture</span>
            <span className="legend-item-s"><span className="legend-dot-s empty"></span> Free Slot</span>
          </div>
          <span className="class-group-label">{studentSession.dept} · {studentSession.sem}</span>
        </div>

        <div className="timetable-grid-scroll-s">
          <table className="timetable-table-s">
            <thead>
              <tr>
                <th className="day-col-header-s">Day / Period</th>
                {PERIODS.map(p => (
                  <th key={p}>
                    <div className="period-header-s">
                      <span className="period-number-s">Period {p}</span>
                      <span className="period-time-s"><Clock size={11} /> {PERIOD_TIMES[p]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                DAYS_ORDER.map(day => (
                  <tr key={day}>
                    <td className="day-name-cell-s">{day}</td>
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
                    <td className="day-name-cell-s">{day}</td>
                    {PERIODS.map(p => {
                      const slot = getSlot(day, p);
                      if (slot) {
                        return (
                          <td key={p}>
                            <div className="timetable-slot-s active animate-scale-in">
                              <p className="slot-subject-s">{slot.subject}</p>
                              <p className="slot-faculty-s">{slot.faculty}</p>
                              <p className="slot-classroom-s"><MapPin size={11} /> {slot.classroom || 'LH-101'}</p>
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={p}>
                          <div className="timetable-slot-s empty">
                            <span className="empty-text-s">Free Slot</span>
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

export default StudentTimetable;
