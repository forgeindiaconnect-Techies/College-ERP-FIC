import React, { useState, useEffect, useCallback } from 'react';
import { getUsers } from '../../api/index';
import useRealtimeSync from '../../hooks/useRealtimeSync';
import { 
  Building2, Users, GraduationCap, UserCheck, 
  Sparkles, Search, Filter, ChevronRight, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../pages/Dashboard.css';

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
  }, []);

  // Sync users in real-time
  useRealtimeSync(fetchData, ['users', 'students', 'staff']);

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
        background: 'linear-gradient(135deg, var(--primary), #a855f7)',
        borderRadius: '20px',
        padding: '2rem 2.5rem',
        marginBottom: '2.5rem',
        color: '#fff',
        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative blob */}
        <div style={{ position: 'absolute', top: '-50%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Institution Roster
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem', fontWeight: 500 }}>
            Welcome back, {userName}. Monitor all registered HODs, Staff, and Students across departments.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(10px)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
            Live DB Sync
          </div>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-purple">
            <UserCheck size={24} />
          </div>
          <div className="stat-details">
            <h3>Total HODs</h3>
            <p className="stat-value">{metrics.hods}</p>
            <p className="stat-change text-muted">Department Heads</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-violet">
            <Briefcase size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Staff</h3>
            <p className="stat-value">{metrics.staff}</p>
            <p className="stat-change text-muted">Active Faculty</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-blue">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Students</h3>
            <p className="stat-value">{metrics.students}</p>
            <p className="stat-change text-muted">Registered Scholars</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-icon-orange">
            <Building2 size={24} />
          </div>
          <div className="stat-details">
            <h3>Departments</h3>
            <p className="stat-value">{metrics.depts}</p>
            <p className="stat-change text-muted">Academic Divisions</p>
          </div>
        </div>
      </div>



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
              <div style={{ background: 'linear-gradient(to right, rgba(99, 102, 241,0.1), transparent)', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={24} style={{ color: '#6366F1' }} /> {dept} Division
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', padding: '6px 12px', borderRadius: '8px' }}>
                    {data.HOD.length} HOD
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', padding: '6px 12px', borderRadius: '8px' }}>
                    {data.Staff.length} Staff
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', padding: '6px 12px', borderRadius: '8px' }}>
                    {data.Student.length} Students
                  </span>
                </div>
              </div>

              <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* HOD Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Department Head (HOD)</h4>
                  {data.HOD.length === 0 ? <p className="text-muted text-sm">No HOD assigned.</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {data.HOD.map(user => (
                        <div key={user._id} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.3)', borderLeft: '4px solid #7C3AED' }}>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{user.name}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {user.referenceId || 'N/A'}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>✉ {user.email}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Staff Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Faculty & Staff</h4>
                  {data.Staff.length === 0 ? <p className="text-muted text-sm">No staff registered.</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {data.Staff.map(user => (
                        <div key={user._id} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)', borderLeft: '4px solid #8B5CF6' }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{user.name}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {user.referenceId || 'N/A'}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>✉ {user.email}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Students Section */}
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Enrolled Students</h4>
                  {data.Student.length === 0 ? <p className="text-muted text-sm">No students registered.</p> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {data.Student.map(user => (
                        <div key={user._id} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.2)', borderLeft: '4px solid #2563EB' }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{user.name}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {user.referenceId || user.studentId || 'N/A'}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>✉ {user.email}</p>
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
