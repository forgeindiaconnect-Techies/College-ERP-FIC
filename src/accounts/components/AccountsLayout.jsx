import React from 'react';
import { Outlet } from 'react-router-dom';
import AccountsSidebar from './AccountsSidebar';
import Navbar from '../../components/layout/Navbar';
import '../../components/layout/Layout.css';

const AccountsLayout = () => {
  return (
    <div className="layout-container" style={{
      '--primary': '#F97316',
      '--primary-gradient': 'linear-gradient(135deg, #EA580C, #FBBF24)',
      '--shadow-glow': '0 4px 14px 0 rgba(249, 115, 22, 0.25)'
    }}>
      <AccountsSidebar />
      <div className="main-wrapper">
        <Navbar role="Accounts" onMenuToggle={() => {}} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccountsLayout;
