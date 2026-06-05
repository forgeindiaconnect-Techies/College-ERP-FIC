import React, { useContext, useState } from 'react';
import { Bell, Moon, Sun, Search, ChevronDown } from 'lucide-react';
import { ThemeContext } from '../../App';
import './StudentNavbar.css';

const getStudentSession = () => {
  return JSON.parse(sessionStorage.getItem('student_session') || 'null') || {
    name: 'John Doe',
    dept: 'Computer Science',
  };
};

const StudentNavbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const student = getStudentSession();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="student-navbar">
      <div className="student-search-box">
        <Search size={18} className="search-icon-student" />
        <input type="text" placeholder={`Search student directory...`} />
      </div>

      <div className="student-navbar-right">
        <div className="student-session-tag">
          <span className="student-session-dot"></span>
          <span>Student Session</span>
        </div>

        <button className="student-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        <div className="relative" style={{position: 'relative'}}>
          <button className="student-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={19} />
            <span className="student-notif-badge">2</span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-fade-in" style={{position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', width: '18rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.75rem', zIndex: 50, border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
              <div className="p-3 flex justify-between items-center" style={{padding: '0.75rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)'}}>
                <span className="font-bold text-sm">Notifications</span>
                <span className="text-xs text-primary font-bold cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                <div style={{padding: '0.75rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer'}} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="text-xs font-bold text-danger mb-1">Hostel Fee Reminder</div>
                  <div className="text-xs text-muted">You have a pending hostel fee payment. Please clear it immediately.</div>
                  <div className="text-[10px] text-muted mt-1 opacity-70">2 mins ago</div>
                </div>
                <div style={{padding: '0.75rem', cursor: 'pointer'}} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="text-xs font-bold text-primary mb-1">Hostel Allocation</div>
                  <div className="text-xs text-muted">Your room allocation for Boys Hostel-A has been confirmed.</div>
                  <div className="text-[10px] text-muted mt-1 opacity-70">1 hour ago</div>
                </div>
              </div>
              <div style={{padding: '0.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center'}}>
                <span className="text-xs text-primary font-bold cursor-pointer hover:underline">View All</span>
              </div>
            </div>
          )}
        </div>

        <div className="student-profile">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=14b8a6&color=fff`}
            alt="Student"
            className="student-profile-img"
          />
          <div className="student-profile-info">
            <span className="student-profile-name">{student.name}</span>
            <span className="student-profile-role">Student · {student.dept}</span>
          </div>
          <ChevronDown size={15} className="text-muted" />
        </div>
      </div>
    </header>
  );
};

export default StudentNavbar;
