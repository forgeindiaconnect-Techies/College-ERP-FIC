import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';
import Navbar from '../../components/layout/Navbar';
import '../../components/layout/Layout.css';

const StaffLayout = () => {
  return (
    <div className="layout-container" style={{
      '--primary': '#10B981',
      '--primary-gradient': 'linear-gradient(135deg, #059669, #34D399)',
      '--shadow-glow': '0 4px 14px 0 rgba(16, 185, 129, 0.25)'
    }}>
      <StaffSidebar />
      <div className="main-wrapper">
        <Navbar role="Staff" onMenuToggle={() => {}} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
