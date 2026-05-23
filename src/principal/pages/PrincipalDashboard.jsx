import React from 'react';
import { Users, BookOpen, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

const PrincipalDashboard = () => {
  const session = JSON.parse(sessionStorage.getItem('user_session') || '{}');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#1f2937', margin: '0 0 5px 0' }}>Principal Dashboard</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Welcome back, {session.name || 'Dr. Sharma'}</p>
        </div>
        <button 
          onClick={() => {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user_session');
            window.location.href = '/principal/login';
          }}
          style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {[
          { label: 'Total Students', value: '4,250', icon: Users, color: '#3b82f6' },
          { label: 'Total Staff', value: '320', icon: BookOpen, color: '#8b5cf6' },
          { label: 'Avg Attendance', value: '88%', icon: CheckCircle, color: '#10b981' },
          { label: 'Avg CGPA', value: '7.8', icon: TrendingUp, color: '#f59e0b' },
          { label: 'Total Revenue', value: '₹4.2 Cr', icon: DollarSign, color: '#ef4444' }
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ backgroundColor: `${stat.color}20`, padding: '12px', borderRadius: '50%', color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 5px 0', fontWeight: '500' }}>{stat.label}</p>
              <h3 style={{ color: '#1f2937', fontSize: '24px', margin: 0 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', color: '#1f2937', marginTop: 0, marginBottom: '20px' }}>Institution Overview</h2>
        <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
          <p style={{ color: '#6b7280' }}>Institutional Analytics Chart Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
