import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, CalendarCheck,
  BookOpenCheck, Calendar, BookOpen, FileText, ClipboardList, Inbox,
  LogOut, ChevronRight, Megaphone, Settings, IndianRupee
} from 'lucide-react';
import './HodSidebar.css';

const DEPT_CODE_MAP = {
  'Computer Science Engineering': 'CSE',
  'Information Technology': 'IT',
  'Electronics & Communication Engineering': 'ECE',
  'Electrical & Electronics Engineering': 'EEE',
  'Mechanical Engineering': 'MECH',
  'Civil Engineering': 'CIVIL',
  'Artificial Intelligence & Data Science': 'AIDS',
  'Artificial Intelligence & Machine Learning': 'AIML',
  'Cyber Security': 'CYBER',
  'Biomedical Engineering': 'BME',
  'Aeronautical Engineering': 'AERO',
  'Automobile Engineering': 'AUTO',
  'Robotics Engineering': 'ROBOTICS',
  'Chemical Engineering': 'CHEM',
  'Biotechnology Engineering': 'BIOTECH',
  'Computer Science': 'CSE',
  'Electronics & Comm.': 'ECE',
  'Electrical Engg.': 'EE',
  'Mechanical Engg.': 'MECH',
  'Bachelor of Computer App.': 'BCA',
  'Master of Business Admin.': 'MBA'
};

const HodSidebar = () => {
  const navigate = useNavigate();

  // Read HOD session inside the component to keep it reactive
  const hodSession = JSON.parse(sessionStorage.getItem('hod_session') || 'null') || {
    name: 'Prof. Rajan Iyer',
    dept: 'Computer Science',
    deptCode: 'CSE',
    role: 'HOD',
  };

  const deptCode = DEPT_CODE_MAP[hodSession.dept] || hodSession.deptCode || 'HOD';

  const menuItems = [
    { name: 'Dashboard', path: '/hod', icon: <LayoutDashboard size={20} />, exact: true },
    { name: 'Students', path: '/hod/students', icon: <Users size={20} /> },
    { name: 'Staff', path: '/hod/staff', icon: <GraduationCap size={20} /> },
    { name: 'Subjects', path: '/hod/subjects', icon: <BookOpen size={20} /> },
    { name: 'Assignments', path: '/hod/assignments', icon: <FileText size={20} /> },
    { name: 'Attendance', path: '/hod/attendance', icon: <CalendarCheck size={20} /> },
    { name: 'Timetable', path: '/hod/timetable', icon: <Calendar size={20} /> },
    { name: 'Leave Approvals', path: '/hod/leaves', icon: <Inbox size={20} /> },
    { name: 'Exams', path: '/hod/exams', icon: <FileText size={20} /> },
    { name: 'Results', path: '/hod/marks', icon: <BookOpenCheck size={20} /> },
    { name: 'Reports', path: '/hod/reports', icon: <ClipboardList size={20} /> },
    { name: 'Payroll', path: '/hod/payroll', icon: <IndianRupee size={20} /> },
    { name: 'Announcements', path: '/hod/announcements', icon: <Megaphone size={20} /> },
    { name: 'Settings', path: '/hod/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('hod_session');
    sessionStorage.removeItem('hod_token');
    navigate('/login');
  };

  return (
    <aside className="hod-sidebar">
      {/* Brand */}
      <div className="hod-sidebar-header">
        <div className="hod-logo">
          <span className="hod-logo-text">ERP</span>
        </div>
        <div>
          <h2 className="hod-brand">HOD Portal</h2>
          <p className="hod-dept-label">{hodSession.dept}</p>
        </div>
      </div>

      {/* Dept Badge */}
      <div className="hod-dept-card">
        <div className="hod-dept-code">{deptCode}</div>
        <div>
          <p className="hod-dept-name">{hodSession.dept}</p>
          <p className="hod-dept-sub">Department View</p>
        </div>
        <ChevronRight size={16} className="hod-chevron" />
      </div>

      {/* Nav */}
      <nav className="hod-nav">
        <ul>
          {menuItems.map((item, i) => (
            <li key={i}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) => isActive ? 'hod-nav-link active' : 'hod-nav-link'}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="hod-sidebar-footer">
        <button className="hod-nav-link logout-btn w-full" onClick={handleLogout}>
          <LogOut size={20} className="logout-icon" />
          <span>Logout</span>
        </button>
        <div className="hod-profile-card">
          <div className="hod-avatar">{hodSession.name.split(' ').pop()[0]}</div>
          <div>
            <p className="hod-profile-name">{hodSession.name}</p>
            <p className="hod-profile-role">Head of Department</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default HodSidebar;
