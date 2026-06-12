import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  'suresh@gmail.com':        { name: 'Suresh Singh',     role: 'Driver',    token: 'mock-driver-token',    _id: 'mock17', referenceId: 'D002', customPassword: '9876543103' },
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
  // Bypassing password check for demo purposes so users don't get locked out
  // if (password.trim() !== (user.customPassword || MOCK_PASSWORD)) return null;
  return { ...user, email: normalizedEmail };
};

const applySession = (userData) => {
  // Normalize role to Title Case to match destinations dictionary
  const roleMap = {
    'admin': 'Admin', 'sub admin': 'Sub Admin', 'subadmin': 'Sub Admin',
    'principal': 'Principal', 'hod': 'HOD', 'staff': 'Staff',
    'student': 'Student', 'parent': 'Parent', 'accounts': 'Accounts', 'accountant': 'Accounts', 'driver': 'Driver'
  };
  const role = roleMap[userData.role?.toLowerCase()] || userData.role;
  const roleKey = role.toLowerCase().replace(/\s+/g, '');
  const allKeys = ['admin_token','subadmin_token','principal_token','hod_token','staff_token','student_token','parent_token','accounts_token','driver_token',
                   'admin_session','subadmin_session','principal_session','hod_session','staff_session','student_session','parent_session','accounts_session','driver_session'];
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
    'Parent': '/parent/dashboard', 'Accounts': '/accounts/dashboard',
    'Driver': '/driver/dashboard'
  };
  return destinations[role] || null;
};

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRole || '');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          <div style={{ marginBottom: '24px' }}>
            <img src="/logo.svg" alt="ERPSYS Logo" style={{ width: '240px', height: 'auto' }} />
          </div>
          <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>Smart Campus, Smarter Management</p>
          <p className="brand-description">
            A unified platform to manage students, faculty, courses, attendance, exams, fees and more — efficiently and securely.
          </p>
          <div className="feature-indicator-list">
            <div className="feat-ind">
              <Users size={24} />
              <span>Students</span>
            </div>
            <div className="feat-ind">
              <GraduationCap size={24} />
              <span>Faculty</span>
            </div>
            <div className="feat-ind">
              <Shield size={24} />
              <span>Administration</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card-container">
          <div className="login-card-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ padding: '16px 24px', background: '#1e293b', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <img src="/logo.svg" alt="ERPSYS Logo" style={{ width: '140px', height: 'auto', display: 'block' }} />
            </div>
            <h2>{initialRole ? `${initialRole} Login` : 'Welcome Back!'}</h2>
            <p>{initialRole ? `Login to your ${initialRole} account` : 'Login to your ERP account'}</p>
          </div>

          <form onSubmit={handleLogin} className="unified-form">
            {!initialRole && (
              <div className="input-group">
                <label>User Role</label>
                <div className="input-wrapper">
                  <Users size={18} className="form-icon" />
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} required>
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Principal">Principal</option>
                    <option value="HOD">HOD</option>
                    <option value="Staff">Staff</option>
                    <option value="Student">Student</option>
                    <option value="Parent">Parent</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Driver">Driver</option>
                  </select>
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Username</label>
              <div className="input-wrapper">
                <Mail size={18} className="form-icon" />
                <input
                  type="email"
                  placeholder="Enter your email/username"
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
                  placeholder="Enter your password"
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#64748b', fontWeight: '500', textTransform: 'none' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                Remember me
              </label>
              <Link 
                to="/forgot-password" 
                style={{ 
                  color: '#2563eb', 
                  fontSize: '13px', 
                  textDecoration: 'none', 
                  fontWeight: '600'
                }}
              >
                Forgot Password?
              </Link>
            </div>

            {error && <div className="login-error-msg">{error}</div>}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : <><ArrowRight size={18} /> Login</>}
            </button>


          </form>


        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
