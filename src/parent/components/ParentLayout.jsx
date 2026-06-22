import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ParentSidebar from './ParentSidebar';
import Navbar from '../../components/layout/Navbar';
import '../../components/layout/Layout.css';

const ParentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  return (
    <div className="layout-container" style={{
      '--primary': '#EC4899',
      '--primary-gradient': 'linear-gradient(135deg, #BE185D, #F472B6)',
      '--shadow-glow': '0 4px 14px 0 rgba(236, 72, 153, 0.25)'
    }}>
      <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Navbar role="Parent" onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
