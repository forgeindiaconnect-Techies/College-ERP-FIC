import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, BookOpenCheck,
  ClipboardList, CreditCard, Calendar, FileText,
  Settings, LogOut, ChevronRight, ChevronDown, Megaphone, GraduationCap, Home, Briefcase, Library, ShieldAlert
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

  const [expandedGroups, setExpandedGroups] = React.useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const menuGroups = [
    {
      name: 'Academics',
      icon: <BookOpenCheck size={18} />,
      items: [
        { name: 'My Attendance', path: '/student/attendance', icon: <CalendarCheck size={18} /> },
        { name: 'Semester Marks', path: '/student/marks', icon: <BookOpenCheck size={18} /> },
        { name: 'Assignments', path: '/student/assignments', icon: <ClipboardList size={18} /> },
        { name: 'Exams', path: '/student/exams', icon: <GraduationCap size={18} /> },
        { name: 'Timetable', path: '/student/timetable', icon: <Calendar size={18} /> }
      ]
    },
    {
      name: 'Campus Life',
      icon: <Home size={18} />,
      items: [
        { name: 'Hostel Allocation', path: '/student/hostel', icon: <Home size={18} /> },
        { name: 'Library', path: '/student/library', icon: <Library size={18} /> },
        { name: 'Placements', path: '/student/placement', icon: <Briefcase size={18} /> }
      ]
    },
    {
      name: 'Administration',
      icon: <FileText size={18} />,
      items: [
        { name: 'Fee Status', path: '/student/fees', icon: <CreditCard size={18} /> },
        { name: 'Leave Requests', path: '/student/leaves', icon: <FileText size={18} /> }
      ]
    },
    {
      name: 'Support & Settings',
      icon: <ShieldAlert size={18} />,
      items: [
        { name: 'Announcements', path: '/student/announcements', icon: <Megaphone size={18} /> },
        { name: 'Student Support Center', path: '/student/welfare', icon: <ShieldAlert size={18} /> },
        { name: 'Profile Settings', path: '/student/settings', icon: <Settings size={18} /> }
      ]
    }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('student_session');
    sessionStorage.removeItem('student_token');
    navigate('/login');
  };

  return (
    <aside className="student-sidebar">
      {/* Brand */}
      <div className="student-sidebar-header" >
        <img src="/logo.svg" alt="ERPSYS Logo" style={{ height: '28px', objectFit: 'contain' }} />
      </div>

      

      {/* Nav links */}
      <nav className="student-nav">
        <ul>
          <li style={{ marginBottom: '0.5rem' }}>
            <NavLink
              to="/student/dashboard"
              className={({ isActive }) => isActive ? 'student-nav-link active' : 'student-nav-link'}
            >
              <LayoutDashboard size={19} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {menuGroups.map((group, idx) => (
            <li key={idx} style={{ marginBottom: '0.5rem' }}>
              <div 
                className="nav-group-header" 
                onClick={() => toggleGroup(group.name)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {group.icon}
                  <span>{group.name}</span>
                </div>
                {expandedGroups[group.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              
              <ul className={`nav-group-items ${expandedGroups[group.name] ? 'expanded' : 'collapsed'}`}>
                {group.items.map((item, i) => (
                  <li key={i}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => isActive ? 'student-nav-link active' : 'student-nav-link'}
                      style={{ paddingLeft: '3rem' }}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
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

export default StudentSidebar;
