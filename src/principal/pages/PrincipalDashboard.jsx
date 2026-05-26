import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, GraduationCap, UserCheck, 
  Percent, FileText, CheckCircle, Briefcase, 
  ChevronRight, BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import '../../pages/Dashboard.css';

// --- DUMMY DATA FOR CHARTS ---

const deptPerformanceData = [
  { name: 'CSE', attendance: 92, passRate: 88, placement: 95 },
  { name: 'ECE', attendance: 88, passRate: 82, placement: 85 },
  { name: 'EEE', attendance: 85, passRate: 78, placement: 80 },
  { name: 'MECH', attendance: 82, passRate: 75, placement: 70 },
  { name: 'MBA', attendance: 95, passRate: 98, placement: 100 },
  { name: 'BCA', attendance: 90, passRate: 85, placement: 90 },
];

const attendanceTrend = [
  { month: 'Jan', rate: 90 },
  { month: 'Feb', rate: 92 },
  { month: 'Mar', rate: 88 },
  { month: 'Apr', rate: 85 },
  { month: 'May', rate: 89 },
];

const feeCollectionData = [
  { name: 'Collected', value: 85, color: '#10b981' },
  { name: 'Pending', value: 15, color: '#ef4444' }
];

const examPerformanceData = [
  { grade: 'O', count: 150 },
  { grade: 'A+', count: 320 },
  { grade: 'A', count: 450 },
  { grade: 'B+', count: 380 },
  { grade: 'B', count: 210 },
  { grade: 'C/F', count: 90 },
];

const placementStats = [
  { year: '2022', placed: 420, offers: 550 },
  { year: '2023', placed: 480, offers: 620 },
  { year: '2024', placed: 510, offers: 700 },
  { year: '2025', placed: 580, offers: 850 },
  { year: '2026', placed: 650, offers: 980 },
];

const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Principal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
    const sessionData = sessionStorage.getItem('principal_session');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      setUserName(parsed.name || 'Principal');
    }
  }, []);

  if (loading) {
    return <div className="loading-state">Loading Principal Dashboard...</div>;
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title text-2xl font-bold">College Overview</h1>
          <p className="text-muted">Welcome back, {userName}. Here is the holistic view of the institution.</p>
        </div>
        <div className="date-badge glass-card px-4 py-2 rounded-lg text-sm font-semibold text-primary border border-primary/20">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* --- TOP METRIC CARDS --- */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-gradient-blue text-white"><Building2 size={20} /></div>
          <div className="stat-details">
            <h3>Total Departments</h3>
            <p className="stat-value">6</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-gradient-green text-white"><Users size={20} /></div>
          <div className="stat-details">
            <h3>Total Students</h3>
            <p className="stat-value">3,450</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-gradient-purple text-white"><GraduationCap size={20} /></div>
          <div className="stat-details">
            <h3>Total Staff</h3>
            <p className="stat-value">245</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-gradient-orange text-white"><UserCheck size={20} /></div>
          <div className="stat-details">
            <h3>Active HODs</h3>
            <p className="stat-value">6</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-gradient-teal text-white"><Percent size={20} /></div>
          <div className="stat-details">
            <h3>Avg. Attendance</h3>
            <p className="stat-value">88.5%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-gradient-green text-white"><CheckCircle size={20} /></div>
          <div className="stat-details">
            <h3>Pass Percentage</h3>
            <p className="stat-value">84.2%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-gradient-pink text-white"><FileText size={20} /></div>
          <div className="stat-details">
            <h3>Pending Approvals</h3>
            <p className="stat-value">12</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-gradient-blue text-white"><Briefcase size={20} /></div>
          <div className="stat-details">
            <h3>Placement Rate</h3>
            <p className="stat-value">92%</p>
          </div>
        </div>
      </div>

      {/* --- ADVANCED CHARTS GRID --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Dept Performance */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Department-wise Performance</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Attendance vs Pass vs Placement Rates</p>
            </div>
            <BarChart2 style={{ color: 'var(--primary)', opacity: 0.5 }} size={20} />
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptPerformanceData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="attendance" name="Attendance %" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="passRate" name="Pass %" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="placement" name="Placement %" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Analytics */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>College Attendance Analytics</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Monthly progression across all departments</p>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} domain={['dataMin - 5', 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                <Area type="monotone" dataKey="rate" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Placement Statistics */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Placement Statistics (5-Year Trend)</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Students placed vs Offers received</p>
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={placementStats} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="placed" name="Students Placed" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="offers" name="Total Offers" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exam Performance & Fees */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 1rem 0' }}>Exam Grade Distribution</h3>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={examPerformanceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={10} hide />
                  <YAxis dataKey="grade" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} cursor={{fill: 'var(--border-color)', opacity: 0.4}} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 1rem 0', width: '100%', textAlign: 'left' }}>Fee Collection</h3>
            <div style={{ height: '180px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feeCollectionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {feeCollectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* --- DEPARTMENT MONITORING GRID --- */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', margin: '2rem 0 1rem 0' }}>Department Monitoring</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {deptPerformanceData.map((dept, idx) => (
          <div 
            key={idx} 
            className="glass-card"
            style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}
            onClick={() => navigate('/principal/departments')}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>{dept.name} Department</h3>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Percent size={12} style={{ color: '#3b82f6' }} /> {dept.attendance}% Attd
                </span>
                <span className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={12} style={{ color: '#10b981' }} /> {dept.passRate}% Pass
                </span>
              </div>
            </div>
            <div className="arrow-wrapper" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContents: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrincipalDashboard;
