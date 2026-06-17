import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PrincipalSidebar from './PrincipalSidebar';
import Navbar from '../../components/layout/Navbar';
import '../../components/layout/Layout.css';

const PrincipalLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout-container" style={{
      '--primary': '#2563EB',
      '--primary-gradient': 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
      '--shadow-glow': '0 4px 14px 0 rgba(37, 99, 235, 0.25)'
    }}>
      <PrincipalSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
      
      <div className={`main-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Navbar role="Principal" onMenuToggle={toggleSidebar} />
        <main className="main-content">
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrincipalLayout;
