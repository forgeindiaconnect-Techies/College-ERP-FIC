import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import SubAdminSidebar from './SubAdminSidebar';
import { ThemeContext } from '../../App';
import '../../components/layout/Layout.css';

const SubAdminLayout = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`layout-container ${theme}`}>
      <SubAdminSidebar />
      <div className="main-wrapper">
        <Navbar role="Sub Admin" />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SubAdminLayout;
