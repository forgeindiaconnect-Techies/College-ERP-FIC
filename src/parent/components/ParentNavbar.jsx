import React, { useContext } from 'react';
import { ThemeContext } from '../../App';
import { Sun, Moon, Bell, Search, User } from 'lucide-react';
import './ParentNavbar.css';

const ParentNavbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="parent-navbar">
      <div className="parent-nav-left">
        <div className="parent-search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search resources..." />
        </div>
      </div>
      
      <div className="parent-nav-right">
        <button className="parent-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <button className="parent-icon-btn notification-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="parent-profile-menu">
          <div className="parent-avatar">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ParentNavbar;
