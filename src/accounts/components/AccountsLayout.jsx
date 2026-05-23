import React from 'react';
import { Outlet } from 'react-router-dom';
import AccountsSidebar from './AccountsSidebar';
import AccountsNavbar from './AccountsNavbar';
import './AccountsLayout.css';

const AccountsLayout = () => {
  return (
    <div className="accounts-layout">
      <AccountsSidebar />
      <div className="accounts-main-wrapper">
        <AccountsNavbar />
        <main className="accounts-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccountsLayout;
