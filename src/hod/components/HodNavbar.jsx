import React, { useContext } from 'react';
import { Bell, Moon, Sun, Search, ChevronDown } from 'lucide-react';
import { ThemeContext } from '../../App';
import './HodNavbar.css';

const HodNavbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Read HOD session inside the component to keep it dynamic and reactive
  const hodSession = JSON.parse(sessionStorage.getItem('hod_session') || 'null') || {
    name: 'Prof. Rajan Iyer',
    dept: 'Electrical Engg.',
  };

  return (
    <header className="hod-navbar">
      <div className="hod-search-box">
        <Search size={18} className="search-icon-hod" />
        <input type="text" placeholder={`Search in ${hodSession.dept}...`} />
      </div>

      <div className="hod-navbar-right">
        <div className="hod-session-tag">
          <span className="hod-session-dot"></span>
          <span>HOD Session</span>
        </div>

        <button className="hod-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        <button className="hod-icon-btn">
          <Bell size={19} />
          <span className="hod-notif-badge">2</span>
        </button>

        <div className="hod-profile">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(hodSession.name)}&background=7c3aed&color=fff`}
            alt="HOD"
            className="hod-profile-img"
          />
          <div className="hod-profile-info">
            <span className="hod-profile-name">{hodSession.name}</span>
            <span className="hod-profile-role">HOD · {hodSession.dept}</span>
          </div>
          <ChevronDown size={15} className="text-muted" />
        </div>
      </div>
    </header>
  );
};

export default HodNavbar;
