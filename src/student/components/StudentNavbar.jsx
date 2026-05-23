import React, { useContext } from 'react';
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

        <button className="student-icon-btn">
          <Bell size={19} />
          <span className="student-notif-badge">2</span>
        </button>

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
