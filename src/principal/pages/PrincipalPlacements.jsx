import React, { useState } from 'react';
import { Briefcase, TrendingUp, DollarSign, Award, Users, Search, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import '../../pages/Dashboard.css';

const placementStats = [
  { year: '2022', placed: 420, offers: 550, avgPkg: 5.4, maxPkg: 28 },
  { year: '2023', placed: 480, offers: 620, avgPkg: 5.8, maxPkg: 32 },
  { year: '2024', placed: 510, offers: 700, avgPkg: 6.2, maxPkg: 36 },
  { year: '2025', placed: 580, offers: 850, avgPkg: 6.5, maxPkg: 42 },
  { year: '2026', placed: 650, offers: 980, avgPkg: 6.8, maxPkg: 45 },
];

const recruiterData = [
  { company: 'Google', placed: 8, avgPkg: 32, maxPkg: 45, logoBg: '#ea4335' },
  { company: 'Microsoft', placed: 12, avgPkg: 28, maxPkg: 40, logoBg: '#00a4ef' },
  { company: 'Amazon', placed: 15, avgPkg: 24, maxPkg: 35, logoBg: '#ff9900' },
  { company: 'TCS', placed: 140, avgPkg: 4.5, maxPkg: 9, logoBg: '#1f2937' },
  { company: 'Infosys', placed: 120, avgPkg: 4.2, maxPkg: 8, logoBg: '#007cc3' },
  { company: 'Cognizant', placed: 95, avgPkg: 4.0, maxPkg: 8.5, logoBg: '#0033a0' },
];

const deptPlacementData = [
  { dept: 'CSE', total: 180, placed: 171, rate: 95, avgPkg: 8.2 },
  { dept: 'ECE', total: 120, placed: 102, rate: 85, avgPkg: 6.5 },
  { dept: 'EEE', total: 100, placed: 80, rate: 80, avgPkg: 5.8 },
  { dept: 'MECH', total: 110, placed: 77, rate: 70, avgPkg: 5.2 },
  { dept: 'BCA', total: 80, placed: 72, rate: 90, avgPkg: 5.5 },
  { dept: 'MBA', total: 60, placed: 60, rate: 100, avgPkg: 7.8 },
];

const placedStudents = [
  { id: 'CS2022001', name: 'John Doe', dept: 'CSE', company: 'Microsoft', pkg: 24, role: 'Software Engineer', status: 'Verified' },
  { id: 'CS2021004', name: 'Emily Davis', dept: 'CSE', company: 'Google', pkg: 35, role: 'Associate PM', status: 'Verified' },
  { id: 'EE2022001', name: 'Alice Smith', dept: 'EEE', company: 'Amazon', pkg: 18, role: 'Systems Engineer', status: 'Pending Verification' },
  { id: 'EE2022002', name: 'Sarah Wilson', dept: 'EEE', company: 'TCS Digital', pkg: 7.5, role: 'Systems Engineer', status: 'Verified' },
  { id: 'EC2022001', name: 'Vikram Seth', dept: 'ECE', company: 'Cognizant', pkg: 4.5, role: 'Programmer Analyst', status: 'Verified' },
  { id: 'BC2022001', name: 'Karan Malhotra', dept: 'BCA', company: 'Infosys', pkg: 4.2, role: 'System Associate', status: 'Verified' },
  { id: 'MB2022001', name: 'Ritu Sen', dept: 'MBA', company: 'Deloitte', pkg: 8.5, role: 'Consultant', status: 'Pending Verification' },
];

const upcomingDrives = [
  { id: 'DR-01', company: 'Intel', date: '2026-06-05', eligibility: 'CGPA >= 8.0 (CSE/ECE)', type: 'On-Campus', status: 'Active' },
  { id: 'DR-02', company: 'Salesforce', date: '2026-06-12', eligibility: 'CGPA >= 8.5 (All)', type: 'On-Campus', status: 'Active' },
  { id: 'DR-03', company: 'Wipro', date: '2026-06-18', eligibility: 'CGPA >= 6.0 (All)', type: 'Pool-Campus', status: 'Pending' },
];

export default function PrincipalPlacements() {
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  const depts = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'BCA', 'MBA'];

  const filteredStudents = placedStudents.filter(s =>
    (filterDept === 'All' || s.dept === filterDept) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="main-content" style={{ padding: '2rem', background: 'var(--bg-primary)', minHeight: 'calc(100vh - 70px)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Briefcase style={{ color: '#3b82f6' }} size={28} /> Placement Cell Control Center
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time monitoring of campus recruitment campaigns, salary distributions, and drives.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Overall Placed', value: '92%', icon: <CheckCircle size={18} />, color: '#10b981', sub: 'Placement Rate' },
          { label: 'Highest Package', value: '45.0 LPA', icon: <DollarSign size={18} />, color: '#6366f1', sub: 'Offered by Google' },
          { label: 'Average Package', value: '6.8 LPA', icon: <TrendingUp size={18} />, color: '#8b5cf6', sub: 'Term Avg Package' },
          { label: 'Total Offers', value: '980 Offers', icon: <Award size={18} />, color: '#f59e0b', sub: 'Campus recruitment' },
          { label: 'Students Placed', value: '650 Placed', icon: <Users size={18} />, color: '#0ea5e9', sub: 'Out of 706 registered' },
          { label: 'Pending Audits', value: '2 Pending', icon: <AlertCircle size={18} />, color: '#ef4444', sub: 'Offer letters' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderBottom: `3px solid ${s.color}` }}>
            <div className="stat-icon-wrapper" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-details">
              <h3>{s.label}</h3>
              <p className="stat-value" style={{ fontSize: '1.25rem' }}>{s.value}</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation tabs */}
      <div className="glass-card" style={{ padding: '0.4rem', borderRadius: 12, display: 'inline-flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {[['overview', '📊 Placements Overview'], ['companies', '🏢 Top Recruiters'], ['students', '🎓 Placed Students Registry'], ['drives', '📅 Recruitment Drives']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '0.55rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, background: tab === key ? '#3b82f6' : 'transparent', color: tab === key ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '1.2rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem' }}>5-Year Placement Trend (Placed vs Offers)</h4>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={placementStats}>
                <defs>
                  <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="offers" name="Total Offers" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOffers)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="placed" name="Placed Count" stroke="#10b981" fillOpacity={1} fill="url(#colorPlaced)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem' }}>Department Placement Rate & Avg Package</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptPlacementData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" domain={[50, 100]} tick={{ fontSize: 9 }} name="Rate %" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} name="LPA" />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="rate" fill="#6366f1" name="Placement Rate %" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avgPkg" fill="#f59e0b" name="Avg Package (LPA)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem' }}>Quick Metrics Audit</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Placement Target', '95%', '#3b82f6'], ['Current Rate', '92%', '#10b981'], ['Salary Average', '6.8 LPA', '#8b5cf6'], ['Max Offer package', '45.0 LPA', '#f59e0b']].map(([k, v, c]) => (
                <div key={k} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${c}` }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recruiters Tab */}
      {tab === 'companies' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem' }}>Top Placement Partners (Count Placed)</h4>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={recruiterData} layout="vertical" barSize={15} margin={{ left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="company" type="category" tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="placed" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Students Placed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Partner Compensation Structure</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recruiterData.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.logoBg }} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', width: 85 }}>{r.company}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Average: <strong>{r.avgPkg} LPA</strong></span>
                      <span>Max: <strong>{r.maxPkg} LPA</strong></span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3 }}>
                      <div style={{ width: `${(r.maxPkg / 45) * 100}%`, height: '100%', background: r.logoBg, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Registry Tab */}
      {tab === 'students' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', margin: 0 }}>Placed Students Registry</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ padding: '0.4rem 0.7rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.8rem' }}>
                {depts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company / name..." style={{ padding: '0.4rem 0.7rem 0.4rem 1.8rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.8rem', width: 200 }} />
              </div>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Student Name</th><th>Department</th><th>Company</th><th>Package (LPA)</th><th>Designation</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No student records found matching the query.</td></tr>
                ) : filteredStudents.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3b82f6' }}>{s.dept}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.company}</td>
                    <td style={{ fontWeight: 800, color: '#10b981', fontSize: '0.88rem' }}>{s.pkg} LPA</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.role}</td>
                    <td>
                      <span style={{ background: s.status === 'Verified' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: s.status === 'Verified' ? '#10b981' : '#f59e0b', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>{s.status}</span>
                    </td>
                    <td>
                      <button style={{ padding: '4px 8px', background: s.status === 'Verified' ? 'rgba(59,130,246,0.1)' : '#3b82f6', color: s.status === 'Verified' ? '#3b82f6' : 'white', border: 'none', borderRadius: 5, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>{s.status === 'Verified' ? 'View Certificate' : 'Verify Offer'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drives Tab */}
      {tab === 'drives' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderRadius: 16 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '1rem' }}>📅 Upcoming Recruitment Drives</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Drive ID</th><th>Recruiter</th><th>Drive Date</th><th>Eligibility Criteria</th><th>Drive Mode</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {upcomingDrives.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.82rem' }}>{d.id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.company}</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{d.date}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.eligibility}</td>
                    <td>
                      <span style={{ background: d.type === 'On-Campus' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)', color: d.type === 'On-Campus' ? '#3b82f6' : '#8b5cf6', padding: '3px 8px', borderRadius: 5, fontSize: '0.72rem', fontWeight: 700 }}>{d.type}</span>
                    </td>
                    <td>
                      <span style={{ background: d.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: d.status === 'Active' ? '#10b981' : '#ef4444', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>{d.status}</span>
                    </td>
                    <td>
                      <button style={{ padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 5, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Register Students</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
