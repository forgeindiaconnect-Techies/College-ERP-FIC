import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, BookOpenCheck,
  CreditCard, Calendar, FileText, Bell, LogOut, ChevronRight
} from 'lucide-react';
import './ParentSidebar.css';

const getParentSession = () => {
  return JSON.parse(sessionStorage.getItem('parent_session') || 'null') || {
    name: 'Parent Name',
    childName: 'Child Name',
    childId: 'CS2022001',
  };
};

const ParentSidebar = () => {
  const navigate = useNavigate();
  const parent = getParentSession();

  const menuItems = [
    { name: 'Dashboard', path: '/parent/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'Child Attendance', path: '/parent/attendance', icon: <CalendarCheck size={19} /> },
    { name: 'Child Marks', path: '/parent/marks', icon: <BookOpenCheck size={19} /> },
    { name: 'Fee Status', path: '/parent/fees', icon: <CreditCard size={19} /> },
    { name: 'Timetable', path: '/parent/timetable', icon: <Calendar size={19} /> },
    { name: 'Leave Status', path: '/parent/leaves', icon: <FileText size={19} /> },
    { name: 'Notifications', path: '/parent/notifications', icon: <Bell size={19} /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('parent_session');
    sessionStorage.removeItem('parent_token');
    navigate('/login');
  };

  return (
    <aside className="parent-sidebar">
      {/* Brand */}
      <div className="parent-sidebar-header" >
        <img src="/logo.svg" alt="ERPSYS Logo" style={{ height: '28px', objectFit: 'contain' }} />
      </div>

      

      {/* Nav links */}
      <nav className="parent-nav">
        <ul>
          {menuItems.map((item, i) => (
            <li key={i}>
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? 'parent-nav-link active' : 'parent-nav-link'}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          onClick={handleLogout} 
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', borderRadius: '8px', transition: 'all 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default ParentSidebar;
