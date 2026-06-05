import React, { useContext, useState } from 'react';
import { Bell, Moon, Sun, Search, ChevronDown } from 'lucide-react';
import { ThemeContext } from '../../App';
import { NotificationContext } from '../../context/NotificationContext';
import './HodNavbar.css';
import '../../components/layout/Navbar.css'; // Reuse notification dropdown styles

const HodNavbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);

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

        <div className="notification-wrapper" style={{ position: 'relative' }}>
          <button className="hod-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={19} />
            {unreadCount > 0 && <span className="hod-notif-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown glass-card animate-fade-in" style={{ position: 'absolute', top: '120%', right: '-40px', width: '320px', zIndex: 100 }}>
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button onClick={markAllAsRead} style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
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
