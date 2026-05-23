import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentNavbar from './StudentNavbar';
import './StudentLayout.css';

const StudentLayout = () => {
  return (
    <div className="student-layout">
      <StudentSidebar />
      <div className="student-main-wrapper">
        <StudentNavbar />
        <main className="student-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
