import React from 'react';
import { Outlet } from 'react-router-dom';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import './ParentLayout.css';

const ParentLayout = () => {
  return (
    <div className="parent-layout">
      <ParentSidebar />
      <div className="parent-main-wrapper">
        <ParentNavbar />
        <main className="parent-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
