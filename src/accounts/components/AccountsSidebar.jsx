import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, AlertCircle, Banknote,
  Receipt, FileText, LogOut, ChevronRight, ChevronDown,
  History, PieChart, Award, X, Wallet, FileBarChart
} from 'lucide-react';
import '../../components/layout/Sidebar.css';

const getAccountsSession = () => {
  return JSON.parse(sessionStorage.getItem('accounts_session') || 'null') || {
    name: 'Finance Admin',
    role: 'Accounts Dept.',
    email: 'finance@college.edu',
  };
};

const AccountsSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const account = getAccountsSession();
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('accounts_session');
    sessionStorage.removeItem('accounts_token');
    navigate('/login');
  };

  const menuGroups = [
    {
      name: 'Fees & Collections',
      icon: <Wallet size={18} />,
      items: [
        { name: 'Fees Collection', path: '/accounts/fees-collection', icon: <CreditCard size={18} /> },
        { name: 'Pending Fees', path: '/accounts/pending-fees', icon: <AlertCircle size={18} /> },
        { name: 'Payment History', path: '/accounts/payment-history', icon: <History size={18} /> }
      ]
    },
    {
      name: 'Financial Operations',
      icon: <Banknote size={18} />,
      items: [
        { name: 'Salary Management', path: '/accounts/salary', icon: <Banknote size={18} /> },
        { name: 'Expense Tracking', path: '/accounts/expenses', icon: <PieChart size={18} /> },
        { name: 'Receipt Generation', path: '/accounts/receipts', icon: <Receipt size={18} /> },
        { name: 'Scholarships', path: '/accounts/scholarships', icon: <Award size={18} /> }
      ]
    },
    {
      name: 'Reports & Analytics',
      icon: <FileBarChart size={18} />,
      items: [
        { name: 'Financial Reports', path: '/accounts/reports', icon: <FileText size={18} /> }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: "flex", flexDirection: "column" }}>`n            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-main)", letterSpacing: "0.5px" }}>{account?.collegeName?.toUpperCase() || "GLOBAL TECH SOLUTION"}</h2>`n            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>Accounts Officer</span>`n          </div>
        <button className="sidebar-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav" style={{ overflowY: 'auto', flex: 1, paddingBottom: '2rem' }}>
        <ul>
          <li style={{ marginBottom: '0.5rem' }}>
            <NavLink 
              to="/accounts/dashboard" 
              end={true}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {menuGroups.map((group, idx) => (
            <li key={idx} style={{ marginBottom: '0.5rem' }}>
              <div 
                className="nav-group-header" 
                onClick={() => toggleGroup(group.name)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {group.icon}
                  <span>{group.name}</span>
                </div>
                {expandedGroups[group.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              
              <ul className={`nav-group-items ${expandedGroups[group.name] ? 'expanded' : 'collapsed'}`}>
                {group.items.map((item, i) => (
                  <li key={i}>
                    <NavLink 
                      to={item.path} 
                      end={item.exact}
                      className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                      style={{ paddingLeft: '3rem' }}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
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
