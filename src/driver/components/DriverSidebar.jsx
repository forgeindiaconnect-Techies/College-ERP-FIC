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
      <div className="driver-sidebar-header">
        <div className="driver-logo">
          <span className="driver-logo-text">ERP</span>
        </div>
        <div>
          <h2 className="driver-brand">Driver Portal</h2>
          <p className="driver-role-label">Fleet Access</p>
        </div>
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

      {/* Footer */}
      <div className="driver-sidebar-footer">
        <button className="driver-nav-link logout-btn w-full" onClick={handleLogout}>
          <LogOut size={20} className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DriverSidebar;
