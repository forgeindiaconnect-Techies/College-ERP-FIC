import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bus, MapPin, Users, Bell, Wrench, Calendar, Navigation, LogOut, ChevronRight, CheckSquare, DollarSign } from 'lucide-react';
import './DriverSidebar.css';

const DriverSidebar = () => {
  const navigate = useNavigate();
  const session = JSON.parse(sessionStorage.getItem('driver_session') || '{}');

  const menuItems = [
    { name: 'Dashboard', path: '/driver/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'My Vehicle', path: '/driver/vehicle', icon: <Wrench size={19} /> },
    { name: 'My Route', path: '/driver/route', icon: <MapPin size={19} /> },
    { name: 'Student List', path: '/driver/students', icon: <Users size={19} /> },
    { name: 'Attendance', path: '/driver/attendance', icon: <Calendar size={19} /> },
    { name: 'My Tasks', path: '/driver/tasks', icon: <CheckSquare size={19} /> },
    { name: 'Payroll', path: '/driver/payroll', icon: <DollarSign size={19} /> },
    { name: 'Notifications', path: '/driver/notifications', icon: <Bell size={19} /> },
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
          {menuItems.map((item, i) => (
            <li key={i}>
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? 'driver-nav-link active' : 'driver-nav-link'}
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

export default DriverSidebar;
