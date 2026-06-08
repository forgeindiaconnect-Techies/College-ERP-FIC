import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  Users, 
  CalendarCheck,
  Megaphone,
  FileBarChart,
  LogOut,
  Bell,
  Activity,
  Library,
  ClipboardList,
  UserCheck,
  Calendar,
  User,
  Bus,
  Building,
  Briefcase,
  Bot
} from 'lucide-react';
import '../../components/layout/Sidebar.css';

const SubAdminSidebar = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [userName, setUserName] = useState('Sub Admin');

  useEffect(() => {
    const sessionData = sessionStorage.getItem('subadmin_session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        setPermissions(parsed.permissions || []);
        setUserName(parsed.name || 'Sub Admin');
      } catch (e) {
        console.error('Error parsing session data', e);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('subadmin_session');
    sessionStorage.removeItem('subadmin_token');
    navigate('/login');
  };

  const allMenuItems = [
    { name: 'Dashboard', path: '/subadmin/dashboard', icon: <LayoutDashboard size={18} />, exact: true, module: 'always' },
    { name: 'Departments', path: '/subadmin/departments', icon: <Building2 size={18} />, module: 'view_departments' },
    { name: 'Students', path: '/subadmin/students', icon: <Users size={18} />, module: 'manage_students' },
    { name: 'Staff', path: '/subadmin/staff', icon: <GraduationCap size={18} />, module: 'manage_staff' },
    { name: 'Attendance', path: '/subadmin/attendance', icon: <CalendarCheck size={18} />, module: 'view_attendance' },
    { name: 'Timetable', path: '/subadmin/timetable', icon: <Calendar size={18} />, module: 'always' },
    { name: 'Reports', path: '/subadmin/reports', icon: <ClipboardList size={19} />, module: 'reports' },
    { name: 'Placement', path: '/subadmin/placement', icon: <Briefcase size={19} />, module: 'always' },
    { name: 'Announcements', path: '/subadmin/announcements', icon: <Megaphone size={18} />, module: 'create_announcements' },
    { name: 'Notifications', path: '/subadmin/notifications', icon: <Bell size={18} />, module: 'always' },
    { name: 'Activity Logs', path: '/subadmin/activity-logs', icon: <Activity size={18} />, module: 'always' },
    { name: 'Profile', path: '/subadmin/profile', icon: <User size={18} />, module: 'always' }
  ];

  // Filter items based on permissions
  const menuItems = allMenuItems.filter(item => 
    item.module === 'always' || permissions.includes(item.module)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.svg" alt="ERPSYS Logo" style={{ height: '28px', objectFit: 'contain' }} />
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path} 
                end={item.exact}
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button 
          onClick={handleLogout} 
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', borderRadius: '8px', transition: 'all 0.2s', marginBottom: '8px' }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
        <div className="admin-badge">
          <div className="admin-avatar">{userName.charAt(0)}</div>
          <div className="admin-info">
            <p className="admin-name">{userName}</p>
            <p className="admin-role">Sub Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SubAdminSidebar;
