import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bus, MapPin, Users, Bell, Wrench, Calendar, Navigation, LogOut, ChevronRight, ChevronDown, CheckSquare, DollarSign } from 'lucide-react';
import './DriverSidebar.css';

const DriverSidebar = () => {
  const navigate = useNavigate();
  const session = JSON.parse(sessionStorage.getItem('driver_session') || '{}');

  const [expandedGroups, setExpandedGroups] = React.useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const menuGroups = [
    {
      name: 'Transport Ops',
      icon: <Bus size={18} />,
      items: [
        { name: 'My Vehicle', path: '/driver/vehicle', icon: <Wrench size={19} /> },
        { name: 'My Route', path: '/driver/route', icon: <MapPin size={19} /> }
      ]
    },
    {
      name: 'Student Transit',
      icon: <Users size={18} />,
      items: [
        { name: 'Student List', path: '/driver/students', icon: <Users size={19} /> },
        { name: 'Attendance', path: '/driver/attendance', icon: <Calendar size={19} /> }
      ]
    },
    {
      name: 'Admin & Tasks',
      icon: <CheckSquare size={18} />,
      items: [
        { name: 'My Tasks', path: '/driver/tasks', icon: <CheckSquare size={19} /> },
        { name: 'Payroll', path: '/driver/payroll', icon: <DollarSign size={19} /> },
        { name: 'Notifications', path: '/driver/notifications', icon: <Bell size={19} /> }
      ]
    }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('driver_session');
    sessionStorage.removeItem('driver_token');
    navigate('/login');
  };

  return (
    <aside className="driver-sidebar">
      {/* Brand */}
      <div className="driver-sidebar-header" >
        <img src="/logo.svg" alt="ERPSYS Logo" style={{ height: '28px', objectFit: 'contain' }} />
      </div>

      {/* Nav links */}
      <nav className="driver-nav">
        <ul>
          <li style={{ marginBottom: '0.5rem' }}>
            <NavLink
              to="/driver/dashboard"
              className={({ isActive }) => isActive ? 'driver-nav-link active' : 'driver-nav-link'}
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
                      className={({ isActive }) => isActive ? 'driver-nav-link active' : 'driver-nav-link'}
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

export default DriverSidebar;
