import React, { useContext, useState } from 'react';
import { Bell, Moon, Sun, Search, ChevronDown } from 'lucide-react';
import { ThemeContext } from '../../App';
import { NotificationContext } from '../../context/NotificationContext';
import './StaffNavbar.css';
import '../../components/layout/Navbar.css'; // Reuse notification dropdown styles

const getStaffSession = () => {
  return JSON.parse(sessionStorage.getItem('staff_session') || 'null') || {
    name: 'Dr. Ananya Rao',
    dept: 'Computer Science',
  };
};

const StaffNavbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);
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

        <div className="notification-wrapper" style={{ position: 'relative' }}>
          <button className="staff-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={19} />
            {unreadCount > 0 && <span className="staff-notif-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown glass-card animate-fade-in" style={{ position: 'absolute', top: '120%', right: '-40px', width: '320px', zIndex: 100 }}>
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button onClick={markAllAsRead} style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
              </div>
              <div className="notification-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No new notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => { markAsRead(notif._id); if (notif.link) window.location.href = notif.link; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: notif.type === 'Warning' ? '#ef4444' : notif.type === 'Success' ? '#10b981' : '#3b82f6' }}>
                          {notif.title}
                        </span>
                        {!notif.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{notif.message}</p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
