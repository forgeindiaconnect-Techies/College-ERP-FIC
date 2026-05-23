import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';
import StaffNavbar from './StaffNavbar';
import './StaffLayout.css';

const StaffLayout = () => {
  return (
    <div className="staff-layout">
      <StaffSidebar />
      <div className="staff-main-wrapper">
        <StaffNavbar />
        <main className="staff-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
