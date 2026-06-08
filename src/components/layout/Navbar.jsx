import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, ChevronDown, Moon, Sun, LayoutGrid, CheckCircle, Menu, LogOut, Settings, User } from 'lucide-react';
import { ThemeContext } from '../../App';
import { NotificationContext } from '../../context/NotificationContext';
import { getDepartments } from '../../api/index';
import { formatDeptWithCourse } from '../../utils/courseHelper';
import './Navbar.css';

const Navbar = ({ role = 'Admin', onMenuToggle }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState(role);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([
    { id: '1', name: 'Computer Science Engineering' },
    { id: '2', name: 'Information Technology' },
    { id: '3', name: 'Electronics & Communication Engineering' },
    { id: '4', name: 'Electrical & Electronics Engineering' },
    { id: '5', name: 'Mechanical Engineering' },
    { id: '6', name: 'Civil Engineering' },
    { id: '7', name: 'Artificial Intelligence & Data Science' },
    { id: '8', name: 'Artificial Intelligence & Machine Learning' },
    { id: '9', name: 'Cyber Security' },
    { id: '10', name: 'Biomedical Engineering' },
    { id: '11', name: 'Aeronautical Engineering' },
    { id: '12', name: 'Automobile Engineering' },
    { id: '13', name: 'Robotics Engineering' },
    { id: '14', name: 'Chemical Engineering' },
    { id: '15', name: 'Biotechnology Engineering' }
  ]);

  useEffect(() => {
    // Determine which session key to check
    const roleKey = role.toLowerCase().replace(/\s+/g, '');
    const sessionKey = `${roleKey}_session`;
    const sessionData = sessionStorage.getItem(sessionKey);
    
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        setUserName(parsed.name || 'User');
        setUserRole(parsed.role || role);
      } catch (e) {
        console.error('Error parsing session data', e);
      }
    }

    getDepartments()
      .then(res => {
        if (res.data && res.data.length > 0) {
          // If backend has real departments, use them instead of fallback
          // setDepartments(res.data); 
          // Note: Keeping fallback for UI consistency based on user request unless backend is heavily populated
        }
      })
      .catch(err => console.error('Failed to load navbar departments:', err));
  }, [role]);

  return (
    <header className="navbar glass-card">
      <div className="navbar-left">
        <button className="hamburger-btn icon-btn" onClick={onMenuToggle} title="Toggle Menu">
          <Menu size={22} />
        </button>
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
            {departments.map(d => (
              <option key={d.id || d._id} value={d.name}>{formatDeptWithCourse(d.name)}</option>
            ))}
          </select>
        </div>

        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="icon-btn">
          <MessageSquare size={20} />
          <span className="badge">3</span>
        </button>
        <div className="notification-wrapper">
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown glass-card animate-fade-in">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button onClick={markAllAsRead} className="text-xs text-primary font-bold">Mark all read</button>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted text-sm">No new notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => { markAsRead(notif._id); if (notif.link) window.location.href = notif.link; }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold text-sm ${notif.type === 'Warning' ? 'text-red-500' : notif.type === 'Success' ? 'text-green-500' : 'text-blue-500'}`}>
                          {notif.title}
                        </span>
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                      </div>
                      <p className="text-xs text-muted mb-1">{notif.message}</p>
                      <span className="text-xs text-muted opacity-70">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="navbar-profile-wrapper" style={{ position: 'relative' }}>
          <div className="navbar-profile" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff`} alt="Profile" className="profile-img" />
            <div className="profile-info">
              <span className="profile-name">{userName}</span>
              <span className="profile-role">{userRole}</span>
            </div>
            <ChevronDown size={16} className="text-muted" />
          </div>

          {showProfileDropdown && (
            <div className="profile-dropdown glass-card animate-fade-in">
              <div className="dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate(`/${role.toLowerCase().replace(/\s+/g, '')}/settings`); }}>
                <User size={16} /> My Profile
              </div>
              <div className="dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate(`/${role.toLowerCase().replace(/\s+/g, '')}/settings`); }}>
                <Settings size={16} /> Settings
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item text-red-500" onClick={() => {
                setShowProfileDropdown(false);
                sessionStorage.clear();
                navigate('/login');
              }}>
                <LogOut size={16} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
