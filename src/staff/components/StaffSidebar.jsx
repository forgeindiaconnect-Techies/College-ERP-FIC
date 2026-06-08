import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, BookOpenCheck,
  ClipboardList, Calendar, LogOut, ChevronRight, FileText, Megaphone, GraduationCap, IndianRupee, Briefcase, Library
} from 'lucide-react';
import './StaffSidebar.css';

// Staff session data — in a real app, this comes from JWT / sessionStorage
const getStaffSession = () => {
  return JSON.parse(sessionStorage.getItem('staff_session') || 'null') || {
    name: 'Dr. Ananya Rao',
    dept: 'Computer Science',
    deptCode: 'CS',
    role: 'Staff',
  };
};

const StaffSidebar = () => {
  const navigate = useNavigate();
  const staffSession = getStaffSession();

  const menuItems = [
    { name: 'Dashboard', path: '/staff/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Announcements', path: '/staff/announcements', icon: <Megaphone size={20} /> },
    { name: 'Take Attendance', path: '/staff/attendance', icon: <CalendarCheck size={20} /> },
    { name: 'Upload Marks', path: '/staff/marks', icon: <BookOpenCheck size={20} /> },
    { name: 'Assignments', path: '/staff/assignments', icon: <ClipboardList size={20} /> },
    { name: 'Exams', path: '/staff/exams', icon: <GraduationCap size={20} /> },
    { name: 'Student List', path: '/staff/students', icon: <Users size={20} /> },
    { name: 'Timetable', path: '/staff/timetable', icon: <Calendar size={20} /> },
    { name: 'Leaves', path: '/staff/leaves', icon: <FileText size={20} /> },
    { name: 'Payroll', path: '/staff/payroll', icon: <IndianRupee size={20} /> },
    { name: 'Placement', path: '/staff/placement', icon: <Briefcase size={20} /> },
    { name: 'Library', path: '/staff/library', icon: <Library size={20} /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('staff_session');
    sessionStorage.removeItem('staff_token');
    navigate('/login');
  };

  return (
    <aside className="staff-sidebar">
      {/* Brand */}
      <div className="staff-sidebar-header">
        <div className="staff-logo">
          <span className="staff-logo-text">ERP</span>
        </div>
        <div>
          <h2 className="staff-brand">Staff Portal</h2>
          <p className="staff-dept-label">{staffSession.dept}</p>
        </div>
      </div>

      

      {/* Nav */}
      <nav className="staff-nav">
        <ul>
          {menuItems.map((item, i) => (
            <li key={i}>
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? 'staff-nav-link active' : 'staff-nav-link'}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="staff-sidebar-footer">
        <button className="staff-nav-link logout-btn w-full" onClick={handleLogout}>
          <LogOut size={20} className="logout-icon" />
          <span>Logout</span>
        </button>
        <div className="staff-profile-card">
          <div className="staff-avatar">{staffSession.name.replace('Dr. ', '').replace('Prof. ', '')[0]}</div>
          <div>
            <p className="staff-profile-name">{staffSession.name}</p>
            <p className="staff-profile-role">Faculty Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StaffSidebar;
