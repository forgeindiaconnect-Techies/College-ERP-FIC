import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';
import './DriverLayout.css';

const DriverGuard = ({ children }) => {
  const session = sessionStorage.getItem('driver_session');
  if (session) return children;
  return <Navigate to="/login" replace />;
};

const DriverLayout = () => {
  return (
    <div className="driver-layout">
      <DriverSidebar />
      <div className="driver-main-wrapper">
        {/* Simple top spacer to match Navbar area */}
        <div style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 2rem', justifyContent: 'flex-end' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#ccfbf1', color: '#0f766e', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                 • Driver Session
              </div>
           </div>
        </div>
        <main className="driver-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
