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
      <div className="parent-sidebar-header">
        <div className="parent-logo">
          <span className="parent-logo-text">ERP</span>
        </div>
        <div>
          <h2 className="parent-brand">Parent Portal</h2>
          <p className="parent-role-label">Monitor Progress</p>
        </div>
      </div>

      {/* Parent Badge Card */}
      <div className="parent-profile-badge-card">
        <div className="parent-dept-code">PA</div>
        <div>
          <p className="parent-sidebar-name">{parent.name}</p>
          <p className="parent-sidebar-sem">Child: {parent.childName}</p>
        </div>
        <ChevronRight size={14} className="parent-chevron" />
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

      {/* Footer */}
      <div className="parent-sidebar-footer">
        <button className="parent-nav-link logout-btn w-full" onClick={handleLogout}>
          <LogOut size={19} className="logout-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default ParentSidebar;
