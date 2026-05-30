import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, Mail, Eye, EyeOff, ArrowRight, Shield, Award, Users, BookOpen, Briefcase } from 'lucide-react';
import { loginUser } from '../api/index';
import './Login.css';

// ── Offline Mock Auth (used when backend is unreachable) ──────────────────────
// Mirrors the exact seed data in backend/server.js so demo login always works.
const MOCK_USERS = {
  'admin@college.edu':        { name: 'System Admin',     role: 'Admin',     token: 'mock-admin-token',     _id: 'mock1' },
  'principal@college.edu':   { name: 'Dr. Suresh Kumar', role: 'Principal', token: 'mock-principal-token', _id: 'mock2' },

  'john@college.edu':        { name: 'John Doe',         role: 'Student',   token: 'mock-student-token',   _id: 'mock4', department: 'Computer Science',          referenceId: 'CS2022001' },
  'emily@college.edu':       { name: 'Emily Davis',      role: 'Student',   token: 'mock-student-token2',  _id: 'mock5', department: 'Computer Science',          referenceId: 'CS2021004' },
  'alice@college.edu':       { name: 'Alice Smith',      role: 'Student',   token: 'mock-student-token3',  _id: 'mock6', department: 'Electrical & Electronics',  referenceId: 'EE2022001' },
  'parent_john@college.edu': { name: 'Parent of John',   role: 'Parent',    token: 'mock-parent-token',    _id: 'mock7', referenceId: 'CS2022001' },
  'parent_alice@college.edu':{ name: 'Parent of Alice',  role: 'Parent',    token: 'mock-parent-token2',   _id: 'mock8', referenceId: 'EE2022001' },
  'accounts@college.edu':    { name: 'Accounts Officer', role: 'Accounts',  token: 'mock-accounts-token',  _id: 'mock9' },
  'karthik@college.edu':     { name: 'Prof. Karthik S.', role: 'Staff',     token: 'mock-staff-token',     _id: 'mock10', department: 'Computer Science' },
  'csehod@gmail.com':        { name: 'CSE HOD',          role: 'HOD',       token: 'mock-hod-token',       _id: 'mock11', department: 'Computer Science',          referenceId: 'STF001' },
  'ecehod@gmail.com':        { name: 'ECE HOD',          role: 'HOD',       token: 'mock-hod-token2',      _id: 'mock12', department: 'Electronics & Comm.',       referenceId: 'STF002' },
  'eeehod@gmail.com':        { name: 'EEE HOD',          role: 'HOD',       token: 'mock-hod-token3',      _id: 'mock13', department: 'Electrical & Electronics',  referenceId: 'STF003' },
  'mechhod@gmail.com':       { name: 'MECH HOD',         role: 'HOD',       token: 'mock-hod-token4',      _id: 'mock14', department: 'Mechanical Engg.',          referenceId: 'STF004' },
  'bcahod@gmail.com':        { name: 'BCA HOD',          role: 'HOD',       token: 'mock-hod-token5',      _id: 'mock15', department: 'Bachelor of Computer App.', referenceId: 'STF005' },
  'mbahod@gmail.com':        { name: 'MBA HOD',          role: 'HOD',       token: 'mock-hod-token6',      _id: 'mock16', department: 'Master of Business Admin.', referenceId: 'STF006' },
};
const MOCK_PASSWORD = 'password123';

const mockLogin = (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  let user = MOCK_USERS[normalizedEmail];
  
  // Check dynamically registered students in demo cache
  if (!user) {
    try {
      const storedStudents = JSON.parse(localStorage.getItem('erp_students') || '[]');
      const foundStudent = storedStudents.find(s => s.email?.toLowerCase() === normalizedEmail);
      if (foundStudent) {
        user = {
          name: foundStudent.name,
          role: 'Student',
          token: `mock-student-token-dynamic-${foundStudent.rollNo}`,
          _id: `dyn-stu-${foundStudent.rollNo}`,
          department: foundStudent.dept || 'Computer Science',
          referenceId: foundStudent.rollNo
        };
      }
    } catch (e) {}
  }

  // Check dynamically registered staff in demo cache
  if (!user) {
    try {
      const storedStaff = JSON.parse(localStorage.getItem('erp_staff') || '[]');
      const foundStaff = storedStaff.find(s => s.email?.toLowerCase() === normalizedEmail);
      if (foundStaff) {
        user = {
          name: foundStaff.name,
          role: foundStaff.designation?.includes('HOD') ? 'HOD' : 'Staff',
          token: `mock-staff-token-dynamic-${foundStaff.id}`,
          _id: `dyn-stf-${foundStaff.id}`,
          department: foundStaff.dept || 'Computer Science',
          referenceId: foundStaff.id,
          subjects: foundStaff.subjects || []
        };
      }
    } catch (e) {}
  }

  if (!user) return null;
  if (password.trim() !== MOCK_PASSWORD) return null;
  return { ...user, email: normalizedEmail };
};

const applySession = (userData) => {
  // Normalize role to Title Case to match destinations dictionary
  const roleMap = {
    'admin': 'Admin', 'sub admin': 'Sub Admin', 'subadmin': 'Sub Admin',
    'principal': 'Principal', 'hod': 'HOD', 'staff': 'Staff',
    'student': 'Student', 'parent': 'Parent', 'accounts': 'Accounts', 'accountant': 'Accounts'
  };
  const role = roleMap[userData.role?.toLowerCase()] || userData.role;
  const roleKey = role.toLowerCase().replace(/\s+/g, '');
  const allKeys = ['admin_token','subadmin_token','principal_token','hod_token','staff_token','student_token','parent_token','accounts_token',
                   'admin_session','subadmin_session','principal_session','hod_session','staff_session','student_session','parent_session','accounts_session'];
  allKeys.forEach(k => sessionStorage.removeItem(k));

  sessionStorage.setItem(`${roleKey}_token`, userData.token);

  const sessionPayload = {
    _id: userData._id, name: userData.name, email: userData.email,
    role, department: userData.department || null,
    referenceId: userData.referenceId || null,
    permissions: userData.permissions || []
  };
  if (role === 'HOD' || role === 'Staff') {
    sessionPayload.dept = userData.department;
    sessionPayload.deptCode = (userData.department || '').substring(0, 2).toUpperCase() || 'CS';
    sessionPayload.subjects = userData.subjects || [];
  } else if (role === 'Student') {
    sessionPayload.id = userData.referenceId;
    sessionPayload.dept = userData.department;
  } else if (role === 'Parent') {
    sessionPayload.childId = userData.referenceId;
    sessionPayload.childName = 'John Doe';
  }
  sessionStorage.setItem(`${roleKey}_session`, JSON.stringify(sessionPayload));

  const destinations = {
    'Admin': '/admin/dashboard', 'Sub Admin': '/subadmin/dashboard',
    'Principal': '/principal/dashboard', 'HOD': '/hod',
    'Staff': '/staff/dashboard', 'Student': '/student/dashboard',
    'Parent': '/parent/dashboard', 'Accounts': '/accounts/dashboard'
  };
  return destinations[role] || null;
};

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHods, setShowHods] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try backend first
      const res = await loginUser({ email, password });
      const userData = res.data;
      const dest = applySession(userData);
      if (dest) { navigate(dest); return; }
      setError('Unknown role. Cannot redirect.');
      setLoading(false);
    } catch (err) {
      // Backend unavailable — fall back to offline mock auth
      const mockUser = mockLogin(email, password);
      if (mockUser) {
        const dest = applySession(mockUser);
        if (dest) { navigate(dest); return; }
      }
      // Real bad credentials (mock also failed)
      setError('Invalid email or password. Please check the demo credentials below.');
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);
    setError('');
    // Try backend, fall back to offline mock if unreachable
    loginUser({ email: demoEmail, password: 'password123' })
      .then((res) => {
        const dest = applySession(res.data);
        if (dest) { window.location.href = dest; }
        else { setError('Unknown role.'); setLoading(false); }
      })
      .catch(() => {
        // Backend down — use offline mock auth
        const mockUser = mockLogin(demoEmail, 'password123');
        if (mockUser) {
          const dest = applySession(mockUser);
          if (dest) { window.location.href = dest; return; }
        }
        setError('Demo login failed. Email not found in mock user list.');
        setLoading(false);
      });
  };

  return (
    <div className="unified-login-container">
      <div className="login-visual-section">
        <div className="visual-overlay"></div>
        <div className="visual-content">
          <div className="logo-badge">
            <GraduationCap size={48} className="logo-icon" />
          </div>
          <h1 className="brand-headline">Apex ERP Portal</h1>
          <p className="brand-description">
            Experience next-generation multi-role college operations, academic metrics, and real-time management.
          </p>
          <div className="feature-indicator-list">
            <div className="feat-ind">
              <span className="feat-dot green"></span>
              <span>Fully Scoped Departmental Access</span>
            </div>
            <div className="feat-ind">
              <span className="feat-dot blue"></span>
              <span>Isolated Multi-Tab Tab Sessions</span>
            </div>
            <div className="feat-ind">
              <span className="feat-dot purple"></span>
              <span>Granular Role-based Dashboards</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card-container">
          <div className="login-card-header">
            <h2>Sign In</h2>
            <p>Access your personalized portal workspace</p>
          </div>

          <form onSubmit={handleLogin} className="unified-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="form-icon" />
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="form-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pwd-toggle-btn"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-12px' }}>
              <Link 
                to="/forgot-password" 
                style={{ 
                  color: '#818cf8', 
                  fontSize: '13px', 
                  textDecoration: 'none', 
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#a5b4fc'}
                onMouseOut={(e) => e.target.style.color = '#818cf8'}
              >
                Forgot Password?
              </Link>
            </div>

            {error && <div className="login-error-msg">{error}</div>}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="demo-credentials-section">
            {showHods ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4>Select HOD Department</h4>
                  <button 
                    type="button" 
                    onClick={() => setShowHods(false)}
                    style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    ← Back to Roles
                  </button>
                </div>
                <p>Click to sign in instantly as specific department head</p>
                <div className="demo-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  {[
                    { name: 'CSE HOD', email: 'csehod@gmail.com', icon: Award, color: '#10b981' },
                    { name: 'ECE HOD', email: 'ecehod@gmail.com', icon: Award, color: '#10b981' },
                    { name: 'EEE HOD', email: 'eeehod@gmail.com', icon: Award, color: '#10b981' },
                    { name: 'MECH HOD', email: 'mechhod@gmail.com', icon: Award, color: '#10b981' },
                    { name: 'BCA HOD', email: 'bcahod@gmail.com', icon: Award, color: '#10b981' },
                    { name: 'MBA HOD', email: 'mbahod@gmail.com', icon: Award, color: '#10b981' }
                  ].map((role) => (
                    <button
                      key={role.name}
                      type="button"
                      className="demo-btn"
                      onClick={() => handleDemoLogin(role.email)}
                      style={{ '--hover-color': role.color, padding: '12px 8px' }}
                    >
                      <role.icon size={16} className="demo-btn-icon" />
                      <span>{role.name}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h4>Quick Demo Access</h4>
                <p>Select a role to pre-fill credentials and sign in instantly</p>
                <div className="demo-grid">
                  {[
                    { name: 'Admin', email: 'admin@college.edu', icon: Shield, color: '#3b82f6' },
                    { name: 'Principal', email: 'principal@college.edu', icon: Award, color: '#0284c7' },

                    { name: 'HODs (6 Depts)', email: 'csehod@gmail.com', icon: Award, color: '#10b981', isSelector: true },
                    { name: 'Staff', email: 'karthik@college.edu', icon: BookOpen, color: '#8b5cf6' },
                    { name: 'Student', email: 'john@college.edu', icon: GraduationCap, color: '#f59e0b' },
                    { name: 'Parent', email: 'parent_john@college.edu', icon: Users, color: '#ec4899' },
                    { name: 'Accounts', email: 'accounts@college.edu', icon: Briefcase, color: '#ef4444' }
                  ].map((role) => (
                    <button
                      key={role.name}
                      type="button"
                      className="demo-btn"
                      onClick={() => {
                        if (role.isSelector) {
                          setShowHods(true);
                        } else {
                          handleDemoLogin(role.email);
                        }
                      }}
                      style={{ '--hover-color': role.color }}
                    >
                      <role.icon size={16} className="demo-btn-icon" />
                      <span>{role.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
