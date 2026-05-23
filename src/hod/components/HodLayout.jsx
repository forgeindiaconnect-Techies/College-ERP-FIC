import React from 'react';
import { Outlet } from 'react-router-dom';
import HodSidebar from './HodSidebar';
import HodNavbar from './HodNavbar';
import './HodLayout.css';

const HodLayout = () => {
  return (
    <div className="hod-layout">
      <HodSidebar />
      <div className="hod-main-wrapper">
        <HodNavbar />
        <main className="hod-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HodLayout;
