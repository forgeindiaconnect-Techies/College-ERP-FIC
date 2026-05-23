import React, { useContext } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, Moon, Sun, LayoutGrid } from 'lucide-react';
import { ThemeContext } from '../../App';
import './Navbar.css';

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="navbar glass-card">
      <div className="navbar-left">
        <div className="navbar-search">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Search students, staff, or departments..." />
        </div>
      </div>
      
      <div className="navbar-actions">
        <div className="dept-switch">
          <LayoutGrid size={18} className="text-muted" />
          <select className="dept-select">
            <option>All Departments</option>
            <option>Computer Science</option>
            <option>Electrical Engg.</option>
            <option>Mechanical Engg.</option>
          </select>
        </div>

        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="icon-btn">
          <MessageSquare size={20} />
          <span className="badge">3</span>
        </button>
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge">5</span>
        </button>
        
        <div className="navbar-profile">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff" alt="Profile" className="profile-img" />
          <div className="profile-info">
            <span className="profile-name">Super Admin</span>
            <span className="profile-role">Admin</span>
          </div>
          <ChevronDown size={16} className="text-muted" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
