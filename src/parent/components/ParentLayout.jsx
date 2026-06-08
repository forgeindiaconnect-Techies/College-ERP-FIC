import React from 'react';
import { Outlet } from 'react-router-dom';
import ParentSidebar from './ParentSidebar';
import Navbar from '../../components/layout/Navbar';
import '../../components/layout/Layout.css';

const ParentLayout = () => {
  return (
    <div className="layout-container" style={{
      '--primary': '#EC4899',
      '--primary-gradient': 'linear-gradient(135deg, #BE185D, #F472B6)',
      '--shadow-glow': '0 4px 14px 0 rgba(236, 72, 153, 0.25)'
    }}>
      <ParentSidebar />
      <div className="main-wrapper">
        <Navbar role="Parent" onMenuToggle={() => {}} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
