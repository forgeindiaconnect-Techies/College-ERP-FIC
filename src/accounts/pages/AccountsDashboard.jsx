import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import {
  CreditCard, AlertCircle, Banknote,
  Receipt, ArrowUpRight, ArrowDownRight, Activity, Users, PieChart as PieChartIcon
} from 'lucide-react';
import { getAllFees } from '../../api/index';
import './AccountsDashboard.css';

const AccountsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountsSession, setAccountsSession] = useState(null);

  useEffect(() => {
    const session = sessionStorage.getItem('accounts_session');
    if (!session) {
      navigate('/accounts/login');
      return;
    }
    
    setAccountsSession(JSON.parse(session));
    setLoading(false);
  }, [navigate]);

  const [fees, setFees] = useState([]);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const res = await getAllFees();
      setFees(res.data);
    } catch (err) {
      console.error('Failed to fetch fees:', err);
      // Fallback to mock data
      setFees(mockRecentTransactions);
    }
  };

  if (loading) {
    return (
      <div className="accounts-loading-container">
        <span className="accounts-spinner-large"></span>
      </div>
    );
  }

  // Mock Financial Data
  const feesCollected = 4500000; // ₹45L
  const feesPending = 850000;    // ₹8.5L
  const todayCollection = 125000; // ₹1.25L
  const totalExpenses = 2800000; // ₹28L
  const salaryProcessed = 1200000; // ₹12L
  const defaultersCount = 45;

  // Monthly Fee Collection Data
  const monthlyCollectionData = [
    { name: 'Jan', collected: 120000 },
    { name: 'Feb', collected: 250000 },
    { name: 'Mar', collected: 450000 },
    { name: 'Apr', collected: 800000 },
    { name: 'May', collected: 1500000 }
  ];

  // Pending Fees Analytics (Department-wise)
  const pendingFeesData = [
    { name: 'Computer Sci', Pending: 250000 },
    { name: 'Electrical', Pending: 180000 },
    { name: 'Mechanical', Pending: 320000 },
    { name: 'Civil', Pending: 100000 }
  ];

  // Department-wise Fees (Pie Chart)
  const deptFeesData = [
    { name: 'Computer Sci', value: 1500000, color: '#3b82f6' },
    { name: 'Electrical', value: 1200000, color: '#10b981' },
    { name: 'Mechanical', value: 1000000, color: '#f59e0b' },
    { name: 'Civil', value: 800000, color: '#8b5cf6' }
  ];

  // Expense Analytics (Pie Chart)
  const expenseData = [
    { name: 'Salaries', value: 1200000, color: '#ef4444' },
    { name: 'Infrastructure', value: 800000, color: '#f97316' },
    { name: 'Events', value: 300000, color: '#eab308' },
    { name: 'Miscellaneous', value: 500000, color: '#8b5cf6' }
  ];

  const mockRecentTransactions = [
    { id: 'TXN-001', student: 'CS2022001', amount: '₹45,000', type: 'Semester Fee', date: '22 May 2026', status: 'Completed' },
    { id: 'TXN-002', student: 'EE2022002', amount: '₹45,000', type: 'Semester Fee', date: '21 May 2026', status: 'Completed' },
    { id: 'TXN-003', student: 'ME2022003', amount: '₹12,000', type: 'Exam Fee', date: '20 May 2026', status: 'Pending' },
    { id: 'TXN-004', student: 'CS2022004', amount: '₹45,000', type: 'Semester Fee', date: '19 May 2026', status: 'Completed' }
  ];

  return (
    <div className="accounts-dashboard animate-fade-in">
      {/* Welcome Banner */}
      <div className="accounts-welcome-banner">
        <div className="banner-left">
          <h1>Finance & Accounts Dashboard</h1>
          <p>Welcome back, {accountsSession?.name}. Here is the current financial summary.</p>
        </div>
        <div className="accounts-badge-number">
          <span>FISCAL YEAR: <strong>2026-2027</strong></span>
        </div>
      </div>

      {/* Metrics Row (6 Cards) */}
      <div className="accounts-metrics-grid">
        <div className="glass-card a-metric-card">
          <div className="metric-icon-a teal"><CreditCard size={22} /></div>
          <div className="a-metric-details">
            <span className="card-title-a">Total Fees Collected</span>
            <h2 className="metric-value-a">₹45.0 L</h2>
            <div className="metric-sub-a text-success"><ArrowUpRight size={14} /> +12% from last month</div>
          </div>
        </div>

        <div className="glass-card a-metric-card">
          <div className="metric-icon-a orange"><AlertCircle size={22} /></div>
          <div className="a-metric-details">
            <span className="card-title-a">Pending Fees</span>
            <h2 className="metric-value-a">₹8.5 L</h2>
            <div className="metric-sub-a text-danger"><ArrowDownRight size={14} /> Outstanding</div>
          </div>
        </div>

        <div className="glass-card a-metric-card">
          <div className="metric-icon-a green"><Activity size={22} /></div>
          <div className="a-metric-details">
            <span className="card-title-a">Today Collection</span>
            <h2 className="metric-value-a">₹1.25 L</h2>
            <div className="metric-sub-a text-success"><ArrowUpRight size={14} /> 15 Receipts today</div>
          </div>
        </div>

        <div className="glass-card a-metric-card">
          <div className="metric-icon-a red"><PieChartIcon size={22} /></div>
          <div className="a-metric-details">
            <span className="card-title-a">Total Expenses</span>
            <h2 className="metric-value-a">₹28.0 L</h2>
            <div className="metric-sub-a text-muted">Across all depts</div>
          </div>
        </div>

        <div className="glass-card a-metric-card">
          <div className="metric-icon-a blue"><Banknote size={22} /></div>
          <div className="a-metric-details">
            <span className="card-title-a">Salary Processed</span>
            <h2 className="metric-value-a">₹12.0 L</h2>
            <div className="metric-sub-a text-success">For current month</div>
          </div>
        </div>

        <div className="glass-card a-metric-card">
          <div className="metric-icon-a purple"><Users size={22} /></div>
          <div className="a-metric-details">
            <span className="card-title-a">Defaulters Count</span>
            <h2 className="metric-value-a">45</h2>
            <div className="metric-sub-a text-danger">Requires follow-up</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid-accounts">
        {/* Monthly Fee Collection */}
        <div className="glass-card chart-card-a">
          <h3>Monthly Fee Collection</h3>
          <p className="text-muted text-sm">Collection volume (in ₹)</p>
          <div className="chart-container-a">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyCollectionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Fees Analytics */}
        <div className="glass-card chart-card-a">
          <h3>Pending Fees Analytics</h3>
          <p className="text-muted text-sm">Department-wise outstanding</p>
          <div className="chart-container-a">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pendingFeesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Fees */}
        <div className="glass-card chart-card-a">
          <h3>Department-wise Fees</h3>
          <p className="text-muted text-sm">Revenue distribution</p>
          <div className="chart-container-a flex-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={deptFeesData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value"
                >
                  {deptFeesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Analytics */}
        <div className="glass-card chart-card-a">
          <h3>Expense Analytics</h3>
          <p className="text-muted text-sm">Outflow distribution</p>
          <div className="chart-container-a flex-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="glass-card a-transactions-card mt-6">
        <div className="a-transactions-header">
          <h3>Recent Transactions</h3>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="a-transactions-table-container">
          <table className="a-transactions-table">
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>Student ID</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.slice(0, 5).map((txn, idx) => (
                <tr key={idx}>
                  <td>{txn.id || txn._id || `TXN-${idx}`}</td>
                  <td>{txn.student || txn.studentId}</td>
                  <td>{txn.type}</td>
                  <td>{txn.date || new Date(txn.createdAt || Date.now()).toLocaleDateString('en-GB')}</td>
                  <td className="font-semibold">{typeof txn.amount === 'number' ? `₹${txn.amount.toLocaleString()}` : txn.amount}</td>
                  <td>
                    <span className={`txn-status ${txn.status?.toLowerCase() || ''}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountsDashboard;
