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
          <Sparkles size={40} className="animate-spin" style={{ color: '#8b5cf6', marginBottom: 12, opacity: 0.8 }} />
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Institution Roster</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '6px 0 0 0' }}>Welcome back, {userName}. Monitor all registered HODs, Staff, and Students across departments.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Live DB Sync
          </div>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total HODs', value: metrics.hods, icon: <UserCheck size={22} />, color: '#f59e0b', sub: 'Department Heads' },
          { label: 'Total Staff', value: metrics.staff, icon: <Briefcase size={22} />, color: '#6366f1', sub: 'Active Faculty' },
          { label: 'Total Students', value: metrics.students, icon: <Users size={22} />, color: '#10b981', sub: 'Registered Scholars' },
          { label: 'Departments', value: metrics.depts, icon: <Building2 size={22} />, color: '#8b5cf6', sub: 'Academic Divisions' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderBottom: `4px solid ${s.color}`, padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-details">
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>{s.label}</h3>
                <p style={{ color: 'var(--text-main)', fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1 }}>{s.value}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '8px', fontWeight: 500 }}>{s.sub}</span>
              </div>
              <div style={{ background: `${s.color}20`, color: s.color, padding: '12px', borderRadius: '12px' }}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Department Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <Filter size={20} className="text-muted" />
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Filter Roster by Department:</span>
        <select 
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 600, outline: 'none' }}
        >
          <option value="All">All Departments</option>
          {deptKeys.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
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
              <div style={{ background: 'linear-gradient(to right, rgba(139,92,246,0.1), transparent)', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={24} style={{ color: '#8b5cf6' }} /> {dept} Division
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '6px 12px', borderRadius: '8px' }}>
                    {data.HOD.length} HOD
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '6px 12px', borderRadius: '8px' }}>
                    {data.Staff.length} Staff
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '8px' }}>
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
                        <div key={user._id} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.3)', borderLeft: '4px solid #f59e0b' }}>
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
                        <div key={user._id} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', borderLeft: '4px solid #6366f1' }}>
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
                        <div key={user._id} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)', borderLeft: '4px solid #10b981' }}>
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
