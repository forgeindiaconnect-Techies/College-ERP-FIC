import React from 'react';
import { Outlet } from 'react-router-dom';
import HodSidebar from './HodSidebar';
import Navbar from '../../components/layout/Navbar';
import '../../components/layout/Layout.css';

const HodLayout = () => {
  return (
    <div className="layout-container" style={{
      '--primary': '#9333EA',
      '--primary-gradient': 'linear-gradient(135deg, #7E22CE, #A855F7)',
      '--shadow-glow': '0 4px 14px 0 rgba(147, 51, 234, 0.25)'
    }}>
      <HodSidebar />
      <div className="main-wrapper">
        <Navbar role="HOD" onMenuToggle={() => {}} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HodLayout;
