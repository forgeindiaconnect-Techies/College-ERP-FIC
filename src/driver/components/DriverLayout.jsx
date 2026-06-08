import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';
import Navbar from '../../components/layout/Navbar';
import '../../components/layout/Layout.css';

const DriverGuard = ({ children }) => {
  const session = sessionStorage.getItem('driver_session');
  if (session) return children;
  return <Navigate to="/login" replace />;
};

const DriverLayout = () => {
  return (
    <div className="layout-container" style={{
      '--primary': '#06B6D4',
      '--primary-gradient': 'linear-gradient(135deg, #0891B2, #22D3EE)',
      '--shadow-glow': '0 4px 14px 0 rgba(6, 182, 212, 0.25)'
    }}>
      <DriverSidebar />
      <div className="main-wrapper">
        <Navbar role="Driver" onMenuToggle={() => {}} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
