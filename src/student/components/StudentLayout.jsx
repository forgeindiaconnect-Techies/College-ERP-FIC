import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import Navbar from '../../components/layout/Navbar';
import '../../components/layout/Layout.css';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  return (
    <div className="layout-container" style={{
      '--primary': '#0EA5E9',
      '--primary-gradient': 'linear-gradient(135deg, #0284C7, #38BDF8)',
      '--shadow-glow': '0 4px 14px 0 rgba(14, 165, 233, 0.25)'
    }}>
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Navbar role="Student" onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
