import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, getStaffSupportRequests } from '../../api/index';
import useRealtimeSync from '../../hooks/useRealtimeSync';
import { 
  Building2, Users, GraduationCap, UserCheck, 
  Sparkles, Search, Filter, ChevronRight, Briefcase, LifeBuoy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../pages/Dashboard.css';
import CollegeInfoCard from '../../components/common/CollegeInfoCard';

export default function PrincipalDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Principal');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [allUsers, setAllUsers] = useState([]);
  const [metrics, setMetrics] = useState({
    students: 0,
    staff: 0,
    hods: 0,
    depts: 0
  });
  const [departmentData, setDepartmentData] = useState({});
  const [selectedDept, setSelectedDept] = useState('All');
  const [pendingStaffRequests, setPendingStaffRequests] = useState(0);

  // Fetch Users from Database
  const fetchData = useCallback(() => {
    getUsers()
      .then(res => {
        const users = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        setAllUsers(users);

        const students = users.filter(u => u.role === 'Student');
        const staff = users.filter(u => u.role === 'Staff');
        const hods = users.filter(u => u.role === 'HOD');

        // Group by department
        const grouped = {};
        users.forEach(user => {
          if (!user.department || user.department === 'None' || user.role === 'Admin' || user.role === 'Principal') return;
          if (!grouped[user.department]) {
            grouped[user.department] = { HOD: [], Staff: [], Student: [] };
          }
          if (grouped[user.department][user.role]) {
            grouped[user.department][user.role].push(user);
          }
        });

        setDepartmentData(grouped);
        setMetrics({
          students: students.length,
          staff: staff.length,
          hods: hods.length,
          depts: Object.keys(grouped).length
        });
      })
      .catch(err => {
        console.warn('Error fetching users', err);
      })
      .finally(() => {
        setLoading(false);
      });

    getStaffSupportRequests().then(res => {
      if (res?.data) {
        setPendingStaffRequests(res.data.filter(r => r.status === 'Pending').length);
      }
    }).catch(err => console.error(err));
  }, []);

  // Sync users in real-time
  useRealtimeSync(fetchData, ['users', 'students', 'staff', 'staffSupportUpdated']);

  useEffect(() => {
    fetchData();
    const sessionData = sessionStorage.getItem('principal_session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        setUserName(parsed.name || 'Principal');
      } catch (e) {
        console.error(e);
      }
    }
  }, [fetchData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 70px)', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Sparkles size={40} className="animate-spin" style={{ color: '#6366F1', marginBottom: 12, opacity: 0.8 }} />
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Loading Institutional Roster...</p>
        </div>
      </div>
    );
  }

  const deptKeys = Object.keys(departmentData).sort();
  const currentDeptData = selectedDept === 'All' 
    ? departmentData 
    : { [selectedDept]: departmentData[selectedDept] };

  return (
    <div className="dashboard-container animate-fade-in" style={{ padding: '2rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Welcome Banner */}
      <div style={{
        background: '#3730A5',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        color: '#fff',
        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative blob */}
        <div style={{ position: 'absolute', top: '-50%', right: '-2%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Institution Roster
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem', fontWeight: 500 }}>
            Welcome back, {userName}. Monitor all registered HODs, Staff, and Students across departments.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 0 2px rgba(74, 222, 128, 0.3)', animation: 'pulse 2s infinite' }} />
            Live DB Sync
          </div>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>
            <UserCheck size={24} />
          </div>
          <div className="stat-details">
            <h3>Total HODs</h3>
            <p className="stat-value">{metrics.hods}</p>
            <p className="stat-change text-muted">Department Heads</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Staff</h3>
            <p className="stat-value">{metrics.staff}</p>
            <p className="stat-change text-muted">Active Faculty</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Students</h3>
            <p className="stat-value">{metrics.students}</p>
            <p className="stat-change text-muted">Registered Scholars</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>
            <Building2 size={24} />
          </div>
          <div className="stat-details">
            <h3>Departments</h3>
            <p className="stat-value">{metrics.depts}</p>
            <p className="stat-change text-muted">Academic Divisions</p>
          </div>
        </div>
      </div>

      {/* Staff Support Notification Widget */}
      {pendingStaffRequests > 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#f59e0b', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <LifeBuoy size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700 }}>Pending Staff Support Requests</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>You have {pendingStaffRequests} staff requests waiting for your review.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/principal/staff-support')}
            style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)' }}
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Department-wise Lists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {Object.keys(currentDeptData).length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
            <Users size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>No users found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Users registered in the Admin dashboard will appear here automatically.</p>
          </div>
        ) : (
          Object.entries(currentDeptData).map(([dept, data]) => (
            <div key={dept} className="glass-card" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={24} style={{ color: '#3730A5' }} /> {dept} Division
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(55, 48, 165, 0.1)', color: '#3730A5', padding: '6px 12px', borderRadius: '8px' }}>
                    {data.HOD.length} HOD
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(55, 48, 165, 0.1)', color: '#3730A5', padding: '6px 12px', borderRadius: '8px' }}>
                    {data.Staff.length} Staff
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(55, 48, 165, 0.1)', color: '#3730A5', padding: '6px 12px', borderRadius: '8px' }}>
                    {data.Student.length} Students
                  </span>
                </div>
              </div>

              <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* HOD Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Department Head (HOD)</h4>
                  {data.HOD.length === 0 ? <p className="text-muted text-sm">No HOD assigned.</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {data.HOD.map(user => (
                        
                        <div key={user._id} style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E3E5EC', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(55, 48, 165, 0.1)', color: '#3730A5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                                {user.name ? (user.name.split(' ').filter(p => p.length > 0 && !p.includes('.')).length >= 2 ? user.name.split(' ').filter(p => p.length > 0 && !p.includes('.'))[0][0] + user.name.split(' ').filter(p => p.length > 0 && !p.includes('.'))[user.name.split(' ').filter(p => p.length > 0 && !p.includes('.')).length - 1][0] : user.name.replace(/[^a-zA-Z]/g, '').substring(0, 2)).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{user.name}</p>
                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {user.referenceId || 'N/A'}</p>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(55, 48, 165, 0.1)', color: '#3730A5', padding: '4px 10px', borderRadius: '6px' }}>HOD</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>✉ {user.email}</p>
                            <span onClick={(e) => { e.stopPropagation(); navigate('/principal/hods'); }} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} className="hover-scale">View Profile →</span>
                          </div>
                        </div>
                      ))}
                      </div>
                  )}
                </div>

                {/* Staff Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Faculty & Staff</h4>
                  {data.Staff.length === 0 ? <p className="text-muted text-sm">No staff registered.</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {data.Staff.map(user => (
                        
                        <div key={user._id} style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E3E5EC', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(55, 48, 165, 0.1)', color: '#3730A5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                                {user.name ? (user.name.split(' ').filter(p => p.length > 0 && !p.includes('.')).length >= 2 ? user.name.split(' ').filter(p => p.length > 0 && !p.includes('.'))[0][0] + user.name.split(' ').filter(p => p.length > 0 && !p.includes('.'))[user.name.split(' ').filter(p => p.length > 0 && !p.includes('.')).length - 1][0] : user.name.replace(/[^a-zA-Z]/g, '').substring(0, 2)).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{user.name}</p>
                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {user.referenceId || 'N/A'}</p>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(55, 48, 165, 0.1)', color: '#3730A5', padding: '4px 10px', borderRadius: '6px' }}>Staff</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>✉ {user.email}</p>
                            <span onClick={(e) => { e.stopPropagation(); navigate('/principal/staff'); }} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} className="hover-scale">View Profile →</span>
                          </div>
                        </div>
                      ))}
                      </div>
                  )}
                </div>

                {/* Students Section */}
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Enrolled Students</h4>
                  {data.Student.length === 0 ? <p className="text-muted text-sm">No students registered.</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {data.Student.map(user => (
                        
                        <div key={user._id} style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E3E5EC', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(55, 48, 165, 0.1)', color: '#3730A5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                                {user.name ? (user.name.split(' ').filter(p => p.length > 0 && !p.includes('.')).length >= 2 ? user.name.split(' ').filter(p => p.length > 0 && !p.includes('.'))[0][0] + user.name.split(' ').filter(p => p.length > 0 && !p.includes('.'))[user.name.split(' ').filter(p => p.length > 0 && !p.includes('.')).length - 1][0] : user.name.replace(/[^a-zA-Z]/g, '').substring(0, 2)).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{user.name}</p>
                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {user.referenceId || user.studentId || 'N/A'}</p>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(55, 48, 165, 0.1)', color: '#3730A5', padding: '4px 10px', borderRadius: '6px' }}>Student</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>✉ {user.email}</p>
                            <span onClick={(e) => { e.stopPropagation(); navigate('/principal/students'); }} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} className="hover-scale">View Profile →</span>
                          </div>
                        </div>
                      ))}
                      </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
