import React, { useContext } from 'react';
import { Bell, Moon, Sun, Search, ChevronDown } from 'lucide-react';
import { ThemeContext } from '../../App';
import './StaffNavbar.css';

const getStaffSession = () => {
  return JSON.parse(sessionStorage.getItem('staff_session') || 'null') || {
    name: 'Dr. Ananya Rao',
    dept: 'Computer Science',
  };
};

const StaffNavbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const staffSession = getStaffSession();

  return (
    <header className="staff-navbar">
      <div className="staff-search-box">
        <Search size={18} className="search-icon-staff" />
        <input type="text" placeholder={`Search in ${staffSession.dept}...`} />
      </div>

      <div className="staff-navbar-right">
        <div className="staff-session-tag">
          <span className="staff-session-dot"></span>
          <span>Staff Session</span>
        </div>

        <button className="staff-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        <button className="staff-icon-btn">
          <Bell size={19} />
          <span className="staff-notif-badge">3</span>
        </button>

        <div className="staff-profile">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(staffSession.name)}&background=3b82f6&color=fff`}
            alt="Staff"
            className="staff-profile-img"
          />
          <div className="staff-profile-info">
            <span className="staff-profile-name">{staffSession.name}</span>
            <span className="staff-profile-role">Faculty · {staffSession.dept}</span>
          </div>
          <ChevronDown size={15} className="text-muted" />
        </div>
      </div>
    </header>
  );
};

export default StaffNavbar;
