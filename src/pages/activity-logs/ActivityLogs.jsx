import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, MapPin, User, Activity, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import './ActivityLogs.css';

const MOCK_LOGS = [
  { id: 'LOG001', user: 'Admin', role: 'Super Admin', action: 'Assigned HOD to IT', module: 'System Settings', date: '2026-05-26 10:45 AM', ip: '192.168.1.10', status: 'Success', dept: 'IT' },
  { id: 'LOG002', user: 'Ramesh K.', role: 'Sub Admin', action: 'Added new student', module: 'Student Management', date: '2026-05-26 09:30 AM', ip: '192.168.1.14', status: 'Success', dept: 'CSE' },
  { id: 'LOG003', user: 'Dr. Ananya', role: 'HOD', action: 'Updated attendance', module: 'Attendance', date: '2026-05-26 08:15 AM', ip: '192.168.1.22', status: 'Success', dept: 'ECE' },
  { id: 'LOG004', user: 'Prof. Karthik', role: 'Staff', action: 'Uploaded internal marks', module: 'Examinations', date: '2026-05-25 04:20 PM', ip: '192.168.1.35', status: 'Success', dept: 'CSE' },
  { id: 'LOG005', user: 'John Doe', role: 'Student', action: 'Failed login attempt', module: 'Authentication', date: '2026-05-25 02:10 PM', ip: '117.204.14.2', status: 'Failed', dept: 'CSE' },
  { id: 'LOG006', user: 'Sub Admin', role: 'Sub Admin', action: 'Sent announcement', module: 'Announcements', date: '2026-05-25 11:00 AM', ip: '192.168.1.14', status: 'Success', dept: 'All' },
  { id: 'LOG007', user: 'Accounts Dept', role: 'Accounts', action: 'Generated fees report', module: 'Reports', date: '2026-05-24 03:45 PM', ip: '192.168.1.50', status: 'Success', dept: 'All' },
  { id: 'LOG008', user: 'Dr. Meena', role: 'HOD', action: 'Approved staff leave', module: 'Leaves', date: '2026-05-24 10:15 AM', ip: '192.168.1.23', status: 'Success', dept: 'MECH' },
];

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Determine user context
  const [userContext, setUserContext] = useState({ role: 'Guest', dept: null });

  useEffect(() => {
    // 1. Figure out who is viewing this page
    let context = { role: 'Guest', dept: null };
    if (sessionStorage.getItem('admin_session')) {
      context = { role: 'Admin', dept: null };
    } else if (sessionStorage.getItem('subadmin_session')) {
      context = { role: 'Sub Admin', dept: null };
    } else if (sessionStorage.getItem('hod_session')) {
      try {
        const hodData = JSON.parse(sessionStorage.getItem('hod_session'));
        context = { role: 'HOD', dept: hodData.deptCode || 'CS' }; // default CS if not parsed correctly
      } catch (e) {
        context = { role: 'HOD', dept: 'CSE' };
      }
    }
    setUserContext(context);

    // 2. Filter Mock Logs based on role
    setTimeout(() => {
      let visibleLogs = [...MOCK_LOGS];
      
      if (context.role === 'Sub Admin') {
        // Sub Admin cannot see Super Admin logs or System Settings modifications
        visibleLogs = visibleLogs.filter(l => l.role !== 'Super Admin' && l.module !== 'System Settings');
      } else if (context.role === 'HOD') {
        // HOD sees only logs affecting their department (or their own actions)
        visibleLogs = visibleLogs.filter(l => l.dept === context.dept || l.role === 'HOD');
      }
      // Admin sees everything.

      setLogs(visibleLogs);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.module.toLowerCase().includes(q);
    const matchRole = roleFilter === 'All' || l.role === roleFilter;
    return matchSearch && matchRole;
  });

  const uniqueRoles = ['All', ...new Set(logs.map(l => l.role))];

  return (
    <div className="activity-logs-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>System Activity & Audit Logs</h1>
          <p className="text-muted">
            Track and monitor all actions happening within the ERP system. 
            <span style={{ marginLeft: '8px', padding: '2px 8px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--primary)', border: '1px solid var(--border-color)' }}>
              Viewing as: {userContext.role} {userContext.dept ? `(${userContext.dept})` : ''}
            </span>
          </p>
        </div>
      </div>

      <div className="glass-card table-wrapper" style={{ marginTop: '1.5rem' }}>
        <div className="filters-row">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search by user, action, or module..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div className="filter-group">
            <Filter size={14} className="text-muted" />
            <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              {uniqueRoles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>User & Role</th>
                <th>Action Performed</th>
                <th>Module</th>
                <th>Date & Time</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: '16px', borderRadius: '4px' }}></div></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted" style={{ padding: '2rem' }}>No activity logs found for your permission level.</td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="log-avatar">
                          {log.role === 'Super Admin' ? <Shield size={14} /> : <User size={14} />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{log.user}</div>
                          <div className="text-xs text-muted">{log.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium text-sm">{log.action}</span>
                    </td>
                    <td>
                      <span className="log-badge module">{log.module}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Clock size={12} /> {log.date}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
                        <MapPin size={12} /> {log.ip}
                      </div>
                    </td>
                    <td>
                      <span className={`log-badge ${log.status === 'Success' ? 'success' : 'failed'}`}>
                        {log.status === 'Success' ? <CheckCircle size={10} style={{ display: 'inline', marginRight: '4px' }} /> : <AlertCircle size={10} style={{ display: 'inline', marginRight: '4px' }} />}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && (
          <div className="table-footer">
            Showing <strong>{filtered.length}</strong> recorded actions in the audit trail.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
