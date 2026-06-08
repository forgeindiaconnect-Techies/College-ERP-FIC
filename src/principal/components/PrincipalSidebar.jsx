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
  CheckSquare,
  ShieldAlert
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
    { name: 'Assignments', path: '/principal/assignments', icon: <ClipboardList size={18} /> },
    { name: 'Fees Overview', path: '/principal/fees', icon: <ClipboardList size={18} /> },
    { name: 'Communication Center', path: '/principal/communication', icon: <Megaphone size={18} /> },
    { name: 'Meetings & Events', path: '/principal/meetings', icon: <CalendarDays size={18} /> },
    { name: 'Academic Planning', path: '/principal/academic-planning', icon: <CalendarCheck size={18} /> },
    { name: 'Faculty Performance', path: '/principal/faculty-performance', icon: <UserCheck size={18} /> },
    { name: 'Student Welfare & Discipline', path: '/principal/student-welfare', icon: <ShieldAlert size={18} /> },
    { name: 'Reports', path: '/principal/reports', icon: <ClipboardList size={19} /> },
    { name: 'Placements', path: '/principal/placement', icon: <Briefcase size={19} /> },
    { name: 'Settings', path: '/principal/settings', icon: <Settings size={18} /> }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <img src="/logo.svg" alt="ERPSYS Logo" style={{ height: '28px', objectFit: 'contain' }} />
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

export default PrincipalSidebar;
