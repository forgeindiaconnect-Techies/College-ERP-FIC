import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  X,
  LayoutDashboard, 
  Building2, 
  UserCheck,
  GraduationCap, 
  Users, 
  CalendarCheck,
  CalendarDays,
  Megaphone,
  FileBarChart,
  LogOut,
  Briefcase,
  Settings,
  ClipboardList,
  CheckSquare
} from 'lucide-react';
import '../../components/layout/Sidebar.css';

const PrincipalSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Principal');

  useEffect(() => {
    const sessionData = sessionStorage.getItem('principal_session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        setUserName(parsed.name || 'Principal');
      } catch (e) {
        console.error('Error parsing session data', e);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('principal_session');
    sessionStorage.removeItem('principal_token');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/principal/dashboard', icon: <LayoutDashboard size={18} />, exact: true },
    { name: 'Approvals Center', path: '/principal/approvals', icon: <CheckSquare size={18} /> },
    { name: 'Departments', path: '/principal/departments', icon: <Building2 size={18} /> },
    { name: 'HOD Management', path: '/principal/hods', icon: <UserCheck size={18} /> },
    { name: 'Staff Overview', path: '/principal/staff', icon: <GraduationCap size={18} /> },
    { name: 'Students Overview', path: '/principal/students', icon: <Users size={18} /> },
    { name: 'Attendance Analytics', path: '/principal/attendance', icon: <CalendarCheck size={18} /> },
    { name: 'Exam & Results', path: '/principal/exams', icon: <FileBarChart size={18} /> },
    { name: 'Fees Overview', path: '/principal/fees', icon: <ClipboardList size={18} /> },
    { name: 'Communication Center', path: '/principal/communication', icon: <Megaphone size={18} /> },
    { name: 'Meetings & Events', path: '/principal/meetings', icon: <CalendarDays size={18} /> },
    { name: 'Academic Planning', path: '/principal/academic-planning', icon: <CalendarCheck size={18} /> },
    { name: 'Reports', path: '/principal/reports', icon: <ClipboardList size={19} /> },
    { name: 'Placements', path: '/principal/placement', icon: <Briefcase size={19} /> },
    { name: 'Settings', path: '/principal/settings', icon: <Settings size={18} /> }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-icon">E</div>
        <h2>ERP<span className="gradient-text">Sys</span></h2>
        <button className="sidebar-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
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
        <button className="nav-link logout-btn w-full mb-2 text-left" onClick={handleLogout}>
          <LogOut size={18} className="text-danger" />
          <span className="text-danger">Logout</span>
        </button>
        <div className="admin-badge glass-card">
          <div className="admin-avatar" style={{ background: 'var(--primary-color)' }}>{userName.charAt(0)}</div>
          <div className="admin-info">
            <p className="admin-name">{userName}</p>
            <p className="admin-role">Principal</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PrincipalSidebar;
