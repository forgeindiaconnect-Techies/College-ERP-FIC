import React, { useContext } from 'react';
import { ThemeContext } from '../../App';
import { Sun, Moon, Bell, Search, User } from 'lucide-react';
import './AccountsNavbar.css';

const AccountsNavbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="accounts-navbar">
      <div className="accounts-nav-left">
        <div className="accounts-search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search transactions..." />
        </div>
      </div>
      
      <div className="accounts-nav-right">
        <button className="accounts-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <button className="accounts-icon-btn notification-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="accounts-profile-menu">
          <div className="accounts-avatar">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AccountsNavbar;
