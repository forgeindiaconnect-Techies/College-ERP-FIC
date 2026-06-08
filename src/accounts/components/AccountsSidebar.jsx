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
      <div className="accounts-sidebar-header" >
        <img src="/logo.svg" alt="ERPSYS Logo" style={{ height: '28px', objectFit: 'contain' }} />
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
      <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          onClick={handleLogout} 
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', borderRadius: '8px', transition: 'all 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AccountsSidebar;
