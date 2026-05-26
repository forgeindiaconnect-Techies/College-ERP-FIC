import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, Mail, Eye, EyeOff, ArrowRight, Shield, Award, Users, BookOpen, Briefcase } from 'lucide-react';
import { loginUser } from '../api/index';
import './Login.css';

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
      const res = await loginUser({ email, password });
      const userData = res.data;
      const role = userData.role;

      // Remove any leftover tokens/sessions from other roles
      const allKeys = ['admin_token', 'subadmin_token', 'principal_token', 'hod_token', 'staff_token', 'student_token', 'parent_token', 'accounts_token',
                       'admin_session', 'subadmin_session', 'principal_session', 'hod_session', 'staff_session', 'student_session', 'parent_session', 'accounts_session'];
      allKeys.forEach(k => sessionStorage.removeItem(k));

      // Clean check to ensure role is valid
      const allowedRoles = ['Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff', 'Student', 'Parent', 'Accounts'];
      if (!allowedRoles.includes(role)) {
        setError('Unauthorized role returned.');
        setLoading(false);
        return;
      }

      // Store in role-specific session storage to avoid multi-tab conflicts
      // NOTE: 'Sub Admin' has a space so we must normalize it to 'subadmin'
      const roleKey = role.toLowerCase().replace(/\s+/g, '');
      const tokenKey = `${roleKey}_token`;
      const sessionKey = `${roleKey}_session`;

      sessionStorage.setItem(tokenKey, userData.token);
      
      // Customize session payload by role
      const sessionPayload = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: role,
        department: userData.department || null,
        referenceId: userData.referenceId || null,
        permissions: userData.permissions || []
      };
      
      if (role === 'HOD') {
        sessionPayload.dept = userData.department;
        sessionPayload.deptCode = userData.department?.substring(0, 2).toUpperCase() || 'CS';
      } else if (role === 'Staff') {
        sessionPayload.dept = userData.department;
        sessionPayload.deptCode = userData.department?.substring(0, 2).toUpperCase() || 'CS';
        sessionPayload.subjects = [];
      } else if (role === 'Student') {
        sessionPayload.id = userData.referenceId;
        sessionPayload.dept = userData.department;
      } else if (role === 'Parent') {
        sessionPayload.childId = userData.referenceId;
        sessionPayload.childName = 'John Doe';
      }

      sessionStorage.setItem(sessionKey, JSON.stringify(sessionPayload));

      // Redirect target based on role
      switch (role) {
        case 'Admin':
          window.location.href = '/admin/dashboard';
          break;
        case 'Sub Admin':
          window.location.href = '/subadmin/dashboard';
          break;
        case 'Principal':
          window.location.href = '/principal/dashboard';
          break;
        case 'HOD':
          window.location.href = '/hod';
          break;
        case 'Staff':
          window.location.href = '/staff/dashboard';
          break;
        case 'Student':
          window.location.href = '/student/dashboard';
          break;
        case 'Parent':
          window.location.href = '/parent/dashboard';
          break;
        case 'Accounts':
          window.location.href = '/accounts/dashboard';
          break;
        default:
          setError('Unknown dashboard destination.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Check demo users below.');
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    // We execute standard form validation via timeout to let react state commit
    setTimeout(() => {
      setLoading(true);
      setError('');
      loginUser({ email: demoEmail, password: 'password123' })
        .then((res) => {
          const userData = res.data;
          const role = userData.role;

          // Remove any leftover tokens/sessions from other roles
          const allKeys = ['admin_token', 'subadmin_token', 'principal_token', 'hod_token', 'staff_token', 'student_token', 'parent_token', 'accounts_token',
                           'admin_session', 'subadmin_session', 'principal_session', 'hod_session', 'staff_session', 'student_session', 'parent_session', 'accounts_session'];
          allKeys.forEach(k => sessionStorage.removeItem(k));

          const roleKey = role.toLowerCase().replace(/\s+/g, '');
          const tokenKey = `${roleKey}_token`;
          const sessionKey = `${roleKey}_session`;
          
          sessionStorage.setItem(tokenKey, userData.token);
          
          const sessionPayload = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: role,
            department: userData.department || null,
            referenceId: userData.referenceId || null,
            permissions: userData.permissions || []
          };
          
          if (role === 'HOD' || role === 'Staff') {
            sessionPayload.dept = userData.department;
            sessionPayload.deptCode = userData.department?.substring(0, 2).toUpperCase() || 'CS';
          } else if (role === 'Student') {
            sessionPayload.id = userData.referenceId;
            sessionPayload.dept = userData.department;
          } else if (role === 'Parent') {
            sessionPayload.childId = userData.parentOf || userData.referenceId;
            sessionPayload.childName = 'John Doe';
          }
          
          sessionStorage.setItem(sessionKey, JSON.stringify(sessionPayload));

          if (role === 'HOD') window.location.href = '/hod';
          else if (role === 'Sub Admin') window.location.href = '/subadmin/dashboard';
          else if (role === 'Principal') window.location.href = '/principal/dashboard';
          else window.location.href = `/${role.toLowerCase()}/dashboard`;
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Failed to authenticate demo user.');
          setLoading(false);
        });
    }, 100);
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
                    { name: 'Sub Admin', email: 'subadmin@college.edu', icon: Shield, color: '#0ea5e9' },
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
