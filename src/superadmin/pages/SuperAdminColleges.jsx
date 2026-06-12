import React, { useState, useEffect } from 'react';
import { Search, Building2, User, Phone, Mail, Activity, AlertTriangle, MoreVertical, Shield } from 'lucide-react';
import api from '../../api';
import ConfirmModal from '../../components/common/ConfirmModal';

const SuperAdminColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/colleges');
      setColleges(res.data);
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (collegeId, currentStatus) => {
    try {
      // Backend doesn't have an activate/deactivate route yet, simulating
      // Normally we would: await api.put(`/auth/colleges/${collegeId}/status`, { status: newStatus })
      setModalState({
        isOpen: true,
        type: 'info',
        title: 'Feature Under Construction',
        message: `Activating/Deactivating college is under construction. ID: ${collegeId}`
      });
    } catch (error) {
      console.error(error);
    }
  };

  const filteredColleges = colleges.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (c.tenantId && c.tenantId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <ConfirmModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ ...modalState, isOpen: false })} 
        {...modalState} 
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Colleges Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage all registered tenant institutions.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or Tenant ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 10px 10px 36px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-main)'
            }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Institution</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Administrator</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Plan / Status</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Users</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Loading colleges...</td></tr>
            ) : filteredColleges.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No colleges found.</td></tr>
            ) : (
              filteredColleges.map((college) => (
                <tr key={college._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{college.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {college.tenantId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px' }}>{college.adminName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{college.email}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: college.subscriptionPlan === 'Trial' ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)', color: college.subscriptionPlan === 'Trial' ? '#f59e0b' : '#8b5cf6' }}>
                        {college.subscriptionPlan}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: college.subscriptionStatus === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: college.subscriptionStatus === 'Active' ? '#10b981' : '#ef4444' }}>
                        {college.subscriptionStatus}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                    {college.totalUsers || 0} Registered
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleToggleStatus(college._id, college.subscriptionStatus)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '8px', borderRadius: '8px' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminColleges;
