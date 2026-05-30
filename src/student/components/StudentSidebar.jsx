import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, BookOpenCheck,
  ClipboardList, CreditCard, Calendar, FileText,
  Settings, LogOut, ChevronRight, Megaphone, GraduationCap
} from 'lucide-react';
import './StudentSidebar.css';

// Fallback session
const getStudentSession = () => {
  return JSON.parse(sessionStorage.getItem('student_session') || 'null') || {
    id: 'CS2022001',
    name: 'John Doe',
    dept: 'Cyber Security',
    sem: 'Sem 3',
  };
};

const StudentSidebar = () => {
  const navigate = useNavigate();
  const student = getStudentSession();

  const menuItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'Announcements', path: '/student/announcements', icon: <Megaphone size={19} /> },
    { name: 'My Attendance', path: '/student/attendance', icon: <CalendarCheck size={19} /> },
    { name: 'Semester Marks', path: '/student/marks', icon: <BookOpenCheck size={19} /> },
    { name: 'Assignments', path: '/student/assignments', icon: <ClipboardList size={19} /> },
    { name: 'Exams', path: '/student/exams', icon: <GraduationCap size={19} /> },
    { name: 'Fee Status', path: '/student/fees', icon: <CreditCard size={19} /> },
    { name: 'Timetable', path: '/student/timetable', icon: <Calendar size={19} /> },
    { name: 'Leave Requests', path: '/student/leaves', icon: <FileText size={19} /> },
    { name: 'Profile Settings', path: '/student/settings', icon: <Settings size={19} /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('student_session');
    sessionStorage.removeItem('student_token');
    navigate('/login');
  };

  return (
    <aside className="student-sidebar">
      {/* Brand */}
      <div className="student-sidebar-header">
        <div className="student-logo">
          <span className="student-logo-text">ERP</span>
        </div>
        <div>
          <h2 className="student-brand">Student Hub</h2>
          <p className="student-role-label">Portal Access</p>
        </div>
      </div>

      {/* Student Badge Card */}
      <div className="student-profile-badge-card">
        <div className="student-dept-code">
          {student.id ? student.id.slice(0, 2) : student._id ? student._id.slice(0, 2) : 'ST'}
        </div>
        <div>
          <p className="student-sidebar-name">{student.name}</p>
          <p className="student-sidebar-sem">{student.dept || student.department || 'Cyber Security'} · {student.sem || student.semester || 'Sem 3'}</p>
        </div>
        <ChevronRight size={14} className="student-chevron" />
      </div>

      {/* Nav links */}
      <nav className="student-nav">
        <ul>
          {menuItems.map((item, i) => (
            <li key={i}>
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? 'student-nav-link active' : 'student-nav-link'}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="student-sidebar-footer">
        <button className="student-nav-link logout-btn w-full" onClick={handleLogout}>
          <LogOut size={19} className="logout-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
