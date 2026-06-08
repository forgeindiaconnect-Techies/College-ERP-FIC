import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, AlertCircle, Banknote,
  Receipt, FileText, LogOut, ChevronRight,
  History, PieChart, Award
} from 'lucide-react';
import './AccountsSidebar.css';

const getAccountsSession = () => {
  return JSON.parse(sessionStorage.getItem('accounts_session') || 'null') || {
    name: 'Finance Admin',
    role: 'Accounts Dept.',
    email: 'finance@college.edu',
  };
};

const AccountsSidebar = () => {
  const navigate = useNavigate();
  const account = getAccountsSession();

  const menuItems = [
    { name: 'Dashboard', path: '/accounts/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'Fees Collection', path: '/accounts/fees-collection', icon: <CreditCard size={19} /> },
    { name: 'Pending Fees', path: '/accounts/pending-fees', icon: <AlertCircle size={19} /> },
    { name: 'Student Payment History', path: '/accounts/payment-history', icon: <CreditCard size={19} /> },
    { name: 'Salary Management', path: '/accounts/salary', icon: <Banknote size={19} /> },
    { name: 'Receipt Generation', path: '/accounts/receipts', icon: <Receipt size={19} /> },
    { name: 'Expense Tracking', path: '/accounts/expenses', icon: <LayoutDashboard size={19} /> },
    { name: 'Financial Reports', path: '/accounts/reports', icon: <FileText size={19} /> },
    { name: 'Scholarship Details', path: '/accounts/scholarships', icon: <FileText size={19} /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('accounts_session');
    sessionStorage.removeItem('accounts_token');
    navigate('/login');
  };

  return (
    <aside className="accounts-sidebar">
      {/* Brand */}
      <div className="accounts-sidebar-header">
        <div className="accounts-logo">
          <span className="accounts-logo-text">ERP</span>
        </div>
        <div>
          <h2 className="accounts-brand">Finance Portal</h2>
          <p className="accounts-role-label">Accounts Dept.</p>
        </div>
      </div>

      

      {/* Nav links */}
      <nav className="accounts-nav">
        <ul>
          {menuItems.map((item, i) => (
            <li key={i}>
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? 'accounts-nav-link active' : 'accounts-nav-link'}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="accounts-sidebar-footer">
        <button className="accounts-nav-link logout-btn w-full" onClick={handleLogout}>
          <LogOut size={19} className="logout-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AccountsSidebar;
