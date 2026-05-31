import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  Users, 
  Heart,
  BookOpen,
  Calendar,
  CalendarCheck,
  FileSpreadsheet,
  BookOpenCheck,
  Inbox,
  FileBarChart,
  Megaphone,
  ShieldCheck,
  Settings,
  ChevronRight,
  Wallet,
  Activity,
  PieChart,
  LogOut,
  Library,
  Bus,
  Building,
  Briefcase,
  Bot
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_token');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} />, exact: true },
    { name: 'Departments', path: '/admin/departments', icon: <Building2 size={18} /> },
    { name: 'HODs', path: '/admin/hods', icon: <GraduationCap size={18} style={{ color: 'var(--primary)' }} /> },
    { name: 'Staff', path: '/admin/staff', icon: <GraduationCap size={18} /> },
    { name: 'Students', path: '/admin/students', icon: <Users size={18} /> },
    { name: 'Parents', path: '/admin/parents', icon: <Heart size={18} /> },
    { name: 'Subjects', path: '/admin/subjects', icon: <BookOpen size={18} /> },
    { name: 'Timetable', path: '/admin/timetable', icon: <Calendar size={18} /> },
    { name: 'Attendance', path: '/admin/attendance', icon: <CalendarCheck size={18} /> },
    { name: 'Exams', path: '/admin/exams', icon: <FileSpreadsheet size={18} /> },
    { name: 'Results', path: '/admin/marks', icon: <BookOpenCheck size={18} /> },
    { name: 'Fees', path: '/admin/fees', icon: <Wallet size={18} /> },
    { name: 'Payroll', path: '/admin/payroll', icon: <FileSpreadsheet size={18} /> },
    { name: 'Library', path: '/admin/library', icon: <Library size={18} /> },
    { name: 'Transport', path: '/admin/transport', icon: <Bus size={18} /> },
    { name: 'Hostel', path: '/admin/hostel', icon: <Building size={18} /> },
    { name: 'Placement', path: '/admin/placement', icon: <Briefcase size={18} /> },
    { name: 'Leave Requests', path: '/admin/leaves', icon: <Inbox size={18} /> },
    { name: 'Reports', path: '/admin/reports', icon: <FileBarChart size={18} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <PieChart size={18} /> },
    { name: 'Announcements', path: '/admin/announcements', icon: <Megaphone size={18} /> },
    { name: 'Activity Logs', path: '/admin/activity-logs', icon: <Activity size={18} /> },
    { name: 'Settings & Security', path: '/admin/settings', icon: <ShieldCheck size={18} className="text-red-500" /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      
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
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <p className="admin-name">Super Admin</p>
            <p className="admin-role">System Admin</p>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
