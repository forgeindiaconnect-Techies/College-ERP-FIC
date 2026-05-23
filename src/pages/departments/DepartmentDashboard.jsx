import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, UserCheck, BookOpen, Clock, 
  Calendar, FileText, BarChart2, TrendingUp,
  Building2, UserCircle, ArrowRight
} from 'lucide-react';
import { getDepartments, getStudents, getStaff } from '../../api/index';
import './DepartmentDashboard.css';

const ADVANCED_METRICS = [
  { label: 'Total Students', value: (dept) => Number(dept.students).toLocaleString(), color: 'var(--text-main)' },
  { label: 'Total Staff', value: (dept) => dept.staff, color: 'var(--text-main)' },
  { label: 'Total Subjects', value: () => '42', color: 'var(--primary)' },
  { label: 'Today Attendance', value: () => '88%', color: 'var(--success)' },
  { label: 'Pending Leaves', value: () => '5', color: '#f59e0b' },
  { label: 'Upcoming Exams', value: () => '2', color: '#8b5cf6' },
  { label: 'Pass Percentage', value: () => '92%', color: 'var(--success)' },
];

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'students', label: 'Students' },
  { id: 'staff', label: 'Staff' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'timetable', label: 'Timetable' },
  { id: 'exams', label: 'Exams' },
  { id: 'results', label: 'Results' },
  { id: 'reports', label: 'Reports' },
];

const DepartmentDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, stuRes, staffRes] = await Promise.all([
          getDepartments(),
          getStudents(),
          getStaff()
        ]);

        const found = deptRes.data.find(d => d._id === id || d.id === id);
        if (found) {
          setDept(found);
          // Filter students and staff by department name (or code if necessary)
          const deptStudents = stuRes.data ? stuRes.data.filter(s => s.dept === found.name || s.department === found.name) : [];
          const deptStaff = staffRes.data ? staffRes.data.filter(s => s.dept === found.name || s.department === found.name) : [];
          setStudents(deptStudents);
          setStaff(deptStaff);
        } else {
          // Fallback if not found
          setDept({ id: id, name: 'Unknown', code: 'N/A', hod: 'Not Assigned', students: 0, staff: 0, status: 'Unknown' });
        }
      } catch (err) {
        console.error("Error fetching department data:", err);
        setDept({ id: id, name: 'Error', code: 'ERR', hod: 'Error', students: 0, staff: 0, status: 'Error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="dept-detail-wrapper">
        <div className="skeleton" style={{ height: '120px', borderRadius: '16px', marginBottom: '2rem' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
           {Array.from({length: 8}).map((_, i) => <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="dept-detail-wrapper animate-fade-in">
      {/* Header Banner */}
      <div className="dept-detail-header glass-card">
        <div className="dd-header-top">
          <button className="btn-back" onClick={() => navigate('/admin/departments')}>
            <ArrowLeft size={18} /> Back to Departments
          </button>
          <span className={`status-badge ${dept.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
            {dept.status}
          </span>
        </div>
        
        <div className="dd-header-main">
          <div className="dd-title-section">
            <div className="dd-icon-box">
              <Building2 size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="dd-title">{dept.code} Department Control Center</h1>
              <div className="dd-meta">
                <span className="code-pill">{dept.code}</span>
                <span className="dd-hod">
                  <UserCircle size={16} /> HOD: {dept.hod}
                </span>
              </div>
            </div>
          </div>

          <div className="dd-quick-stats advanced-stats">
            {ADVANCED_METRICS.map((metric, idx) => (
              <div key={idx} className="dd-stat advanced-stat-box">
                <span className="dd-stat-label">{metric.label}</span>
                <span className="dd-stat-value" style={{ color: metric.color }}>
                  {metric.value(dept)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="dd-tabs-container glass-card">
        <div className="dd-tabs-scroll">
          {TABS.map(tab => (
            <button 
              key={tab.id}
              className={`dd-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="dd-tab-content glass-card animate-fade-in">
        {activeTab === 'overview' && (
          <div className="tab-placeholder-panel">
            <div className="tab-placeholder-icon">
              <Building2 size={48} className="text-muted" opacity={0.5} />
            </div>
            <h2>Department Overview</h2>
            <p className="text-muted">Welcome to the {dept?.code || 'Dept'} control center. Select a tab above to manage specific modules.</p>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Student Roster</h2>
              <button className="btn-outline"><ArrowRight size={16}/> Add Student</button>
            </div>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem' }}>Roll No</th>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Year</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? students.map(s => (
                  <tr key={s._id || s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>{s.id || s.rollNo || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>{s.name}</td>
                    <td style={{ padding: '0.75rem' }}>{s.sem || s.year || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`status-badge ${s.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {s.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students found in this department.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'staff' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Faculty Directory</h2>
              <button className="btn-outline"><ArrowRight size={16}/> Add Staff</button>
            </div>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem' }}>Staff ID</th>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Designation</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.length > 0 ? staff.map(s => (
                  <tr key={s._id || s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>{s.id || s.staffId || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>{s.name}</td>
                    <td style={{ padding: '0.75rem' }}>{s.designation || s.role || 'Faculty'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`status-badge ${s.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {s.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No staff found in this department.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {['subjects', 'attendance', 'timetable', 'exams', 'results', 'reports'].includes(activeTab) && (
          <div className="tab-placeholder-panel">
            <div className="tab-placeholder-icon">
              <BookOpen size={48} className="text-muted" opacity={0.5} />
            </div>
            <h2>{TABS.find(t => t.id === activeTab)?.label} Management</h2>
            <p className="text-muted">
              Dummy data for {TABS.find(t => t.id === activeTab)?.label.toLowerCase()} is being populated. MongoDB connection pending.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentDashboard;
