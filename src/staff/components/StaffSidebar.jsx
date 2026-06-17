import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, BookOpenCheck,
  ClipboardList, Calendar, LogOut, ChevronRight, ChevronDown, FileText, Megaphone, GraduationCap, IndianRupee, Briefcase, Library, LifeBuoy
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

  const [expandedGroups, setExpandedGroups] = React.useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const menuGroups = [
    {
      name: 'Academic Management',
      icon: <BookOpenCheck size={18} />,
      items: [
        { name: 'Take Attendance', path: '/staff/attendance', icon: <CalendarCheck size={18} /> },
        { name: 'Upload Marks', path: '/staff/marks', icon: <BookOpenCheck size={18} /> },
        { name: 'Assignments', path: '/staff/assignments', icon: <ClipboardList size={18} /> },
        { name: 'Exams', path: '/staff/exams', icon: <GraduationCap size={18} /> },
        { name: 'Timetable', path: '/staff/timetable', icon: <Calendar size={18} /> }
      ]
    },
    {
      name: 'Class & Students',
      icon: <Users size={18} />,
      items: [
        { name: 'Student List', path: '/staff/students', icon: <Users size={18} /> }
      ]
    },
    {
      name: 'Resources & Career',
      icon: <Library size={18} />,
      items: [
        { name: 'Library', path: '/staff/library', icon: <Library size={18} /> },
        { name: 'Placement', path: '/staff/placement', icon: <Briefcase size={18} /> }
      ]
    },
    {
      name: 'Communication',
      icon: <Megaphone size={18} />,
      items: [
        { name: 'Announcements', path: '/staff/announcements', icon: <Megaphone size={18} /> },
        { name: 'Leaves', path: '/staff/leaves', icon: <FileText size={18} /> },
        { name: 'Support Center', path: '/staff/support', icon: <LifeBuoy size={18} /> }
      ]
    },
    {
      name: 'Finance',
      icon: <IndianRupee size={18} />,
      items: [
        { name: 'Payroll', path: '/staff/payroll', icon: <IndianRupee size={18} /> }
      ]
    }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('staff_session');
    sessionStorage.removeItem('staff_token');
    navigate('/login');
  };

  return (
    <aside className="staff-sidebar">
      {/* Brand */}
      <div className="staff-sidebar-header" >
        <img src="/logo.svg" alt="ERPSYS Logo" style={{ height: '28px', objectFit: 'contain' }} />
      </div>

      {/* Nav */}
      <nav className="staff-nav">
        <ul>
          <li style={{ marginBottom: '0.5rem' }}>
            <NavLink
              to="/staff/dashboard"
              end={true}
              className={({ isActive }) => isActive ? 'staff-nav-link active' : 'staff-nav-link'}
            >
              <LayoutDashboard size={18} />
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
                      className={({ isActive }) => isActive ? "staff-nav-link active" : "staff-nav-link"}
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

export default StaffSidebar;
