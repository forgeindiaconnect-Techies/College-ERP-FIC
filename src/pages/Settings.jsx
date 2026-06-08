import React, { useState } from 'react';
import {
  Save, Database, Shield, Bell, Globe, CheckCircle2,
  Lock, Key, RefreshCw, AlertCircle, ChevronRight,
  Server, Mail, Smartphone
} from 'lucide-react';
import './Settings.css';

/* ── Tab metadata ────────────────────────────── */
const TABS = [
  {
    id: 'general',
    label: 'General Config',
    sub: 'Institution & semester',
    Icon: Globe,
  },
  {
    id: 'security',
    label: 'Security & Auth',
    sub: 'Passwords & access',
    Icon: Shield,
  },
  {
    id: 'backup',
    label: 'Backup & Reset',
    sub: 'Database snapshots',
    Icon: Database,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    sub: 'Alerts & broadcasting',
    Icon: Bell,
  },
];

/* ── Reusable toggle switch ──────────────────── */
const Toggle = ({ checked, onChange }) => (
  <label className="toggle-switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="toggle-track" />
  </label>
);

/* ── Main component ──────────────────────────── */
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    institutionName: 'Apex Institute of Technology',
    academicYear: '2026 - 2027',
    semesterState: 'Even Semester (In Progress)',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    studentPortalAccess: true,
    parentPortalAccess: true,
    timetableAlerts: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false,
    sessionTimeout: '60 minutes',
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: false,
    feeReminders: true,
    attendanceAlerts: true,
    autoBackup: true,
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = (e) => {
    if (e?.preventDefault) e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="settings-page animate-fade-in">

      {/* ── Page header ── */}
      <div className="settings-header">
        <div>
          <h1>System Settings</h1>
          <p>Configure global ERP parameters, security preferences, and notification rules.</p>
        </div>
        <button className="btn-settings-save" onClick={handleSave}>
          <Save size={16} /> Save All Changes
        </button>
      </div>

      {/* ── Success flash ── */}
      {saved && (
        <div className="settings-success">
          <CheckCircle2 size={17} /> Settings saved successfully!
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="settings-layout">

        {/* Left: nav */}
        <nav className="settings-nav">
          {TABS.map(({ id, label, sub, Icon }) => (
            <button
              key={id}
              className={`settings-nav-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <span className="nav-icon"><Icon size={16} /></span>
              <span className="nav-label">
                <span style={{ display: 'block' }}>{label}</span>
                <span style={{ fontWeight: 400, fontSize: '0.75rem', opacity: 0.75 }}>{sub}</span>
              </span>
              <ChevronRight size={14} className="nav-arrow" />
            </button>
          ))}
        </nav>

        {/* Right: content panel */}
        <div className="settings-panel">

          {/* ─── GENERAL ─── */}
          {activeTab === 'general' && (
            <div className="animate-fade-in">
              <div className="settings-panel-header">
                <div className="settings-panel-icon"><Globe size={18} /></div>
                <div>
                  <h3>General ERP Configuration</h3>
                  <p>Core academic year, semester, and institution settings</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="settings-form">
                <div className="settings-row">
                  <div className="settings-field">
                    <label>Institution Name</label>
                    <input
                      type="text"
                      value={form.institutionName}
                      onChange={e => set('institutionName', e.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <label>Academic Year</label>
                    <select value={form.academicYear} onChange={e => set('academicYear', e.target.value)}>
                      <option>2025 - 2026</option>
                      <option>2026 - 2027</option>
                      <option>2027 - 2028</option>
                    </select>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-field">
                    <label>Current Semester</label>
                    <select value={form.semesterState} onChange={e => set('semesterState', e.target.value)}>
                      <option>Even Semester (In Progress)</option>
                      <option>Odd Semester (In Progress)</option>
                      <option>Summer Vacation</option>
                    </select>
                  </div>
                  <div className="settings-field">
                    <label>Default Currency</label>
                    <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div className="settings-field">
                  <label>Server Timezone</label>
                  <select value={form.timezone} onChange={e => set('timezone', e.target.value)}>
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>America/New_York (EST)</option>
                  </select>
                </div>

                {/* Toggle cards */}
                <label className="settings-toggle-card">
                  <Toggle
                    checked={form.studentPortalAccess}
                    onChange={e => set('studentPortalAccess', e.target.checked)}
                  />
                  <div className="settings-toggle-label">
                    <strong>Student Portal Login Access</strong>
                    <span>When disabled, students see a maintenance screen instead of the login form.</span>
                  </div>
                </label>

                <label className="settings-toggle-card">
                  <Toggle
                    checked={form.parentPortalAccess}
                    onChange={e => set('parentPortalAccess', e.target.checked)}
                  />
                  <div className="settings-toggle-label">
                    <strong>Parent Portal Login Access</strong>
                    <span>Independently gate the parent dashboard during exam result embargoes.</span>
                  </div>
                </label>

                <label className="settings-toggle-card">
                  <Toggle
                    checked={form.timetableAlerts}
                    onChange={e => set('timetableAlerts', e.target.checked)}
                  />
                  <div className="settings-toggle-label">
                    <strong>Timetable Clash Auto-Detection</strong>
                    <span>Scans exam/class room bookings and raises alerts on venue collisions.</span>
                  </div>
                </label>
              </form>
            </div>
          )}

          {/* ─── SECURITY ─── */}
          {activeTab === 'security' && (
            <div className="animate-fade-in">
              <div className="settings-panel-header">
                <div className="settings-panel-icon" style={{ background: 'rgba(99, 102, 241,0.1)', color: '#6366F1' }}>
                  <Shield size={18} />
                </div>
                <div>
                  <h3>Security & Authentication</h3>
                  <p>Manage admin credentials and login session policies</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="settings-form">
                <div className="settings-field">
                  <label><Lock size={12} style={{ display: 'inline', marginRight: 4 }} />Current Admin Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password to authorise changes"
                    value={form.currentPassword}
                    onChange={e => set('currentPassword', e.target.value)}
                  />
                </div>

                <div className="settings-row">
                  <div className="settings-field">
                    <label><Key size={12} style={{ display: 'inline', marginRight: 4 }} />New Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={form.newPassword}
                      onChange={e => set('newPassword', e.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={form.confirmPassword}
                      onChange={e => set('confirmPassword', e.target.value)}
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <label>Session Auto-Logout Timeout</label>
                  <select value={form.sessionTimeout} onChange={e => set('sessionTimeout', e.target.value)}>
                    <option>30 minutes</option>
                    <option>60 minutes</option>
                    <option>2 hours</option>
                    <option>8 hours (Stay Logged In)</option>
                  </select>
                </div>

                <label className="settings-toggle-card">
                  <Toggle
                    checked={form.twoFactor}
                    onChange={e => set('twoFactor', e.target.checked)}
                  />
                  <div className="settings-toggle-label">
                    <strong>Two-Factor Authentication (2FA)</strong>
                    <span>Require OTP verification via email on every admin login for extra protection.</span>
                  </div>
                </label>
              </form>
            </div>
          )}

          {/* ─── BACKUP ─── */}
          {activeTab === 'backup' && (
            <div className="animate-fade-in">
              <div className="settings-panel-header">
                <div className="settings-panel-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                  <Database size={18} />
                </div>
                <div>
                  <h3>Backup & System Recovery</h3>
                  <p>MongoDB snapshot management and cache controls</p>
                </div>
              </div>

              <div className="settings-form">
                <div className="settings-toggle-card" style={{ borderColor: 'rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.03)' }}>
                  <div className="settings-panel-icon" style={{ width: 36, height: 36, borderRadius: 8 }}>
                    <Server size={16} />
                  </div>
                  <div className="settings-toggle-label">
                    <strong>Automatic Scheduled Backups</strong>
                    <span>Full MongoDB dump created daily at 02:00 AM IST. Stored for 14 days.</span>
                  </div>
                  <Toggle
                    checked={form.autoBackup}
                    onChange={e => set('autoBackup', e.target.checked)}
                  />
                </div>

                <div className="settings-stat-row">
                  <div className="stat-card">
                    <span className="stat-label">Last Successful Backup</span>
                    <span className="stat-value green">May 23, 2026 · 02:00 AM</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Stored Snapshots</span>
                    <span className="stat-value blue">14 Retained</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Database Size</span>
                    <span className="stat-value">48.7 MB</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Next Backup</span>
                    <span className="stat-value">May 24, 2026 · 02:00 AM</span>
                  </div>
                </div>

                <div className="settings-action-row">
                  <button type="button" className="btn-settings-primary" onClick={handleSave}>
                    <RefreshCw size={14} /> Backup Now
                  </button>
                  <button type="button" className="btn-settings-danger">
                    <AlertCircle size={14} /> Clear Session Cache
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── NOTIFICATIONS ─── */}
          {activeTab === 'notifications' && (
            <div className="animate-fade-in">
              <div className="settings-panel-header">
                <div className="settings-panel-icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}>
                  <Bell size={18} />
                </div>
                <div>
                  <h3>Notification & Alert Settings</h3>
                  <p>Control how and where ERP broadcasts are delivered</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="settings-form">
                <label className="settings-toggle-card">
                  <Toggle checked={form.emailAlerts} onChange={e => set('emailAlerts', e.target.checked)} />
                  <div className="settings-toggle-label">
                    <strong><Mail size={13} style={{ display: 'inline', marginRight: 4 }} />Email Broadcasting</strong>
                    <span>Send grade releases, fee dues, and leave decisions to registered student email addresses.</span>
                  </div>
                </label>

                <label className="settings-toggle-card">
                  <Toggle checked={form.smsAlerts} onChange={e => set('smsAlerts', e.target.checked)} />
                  <div className="settings-toggle-label">
                    <strong><Smartphone size={13} style={{ display: 'inline', marginRight: 4 }} />SMS Alerts</strong>
                    <span>Dispatch critical low-attendance or pending-fee warnings via SMS gateway.</span>
                  </div>
                </label>

                <label className="settings-toggle-card">
                  <Toggle checked={form.pushAlerts} onChange={e => set('pushAlerts', e.target.checked)} />
                  <div className="settings-toggle-label">
                    <strong>Browser Push Notifications</strong>
                    <span>Real-time pop-ups on student and faculty dashboards for announcements and deadlines.</span>
                  </div>
                </label>

                <label className="settings-toggle-card">
                  <Toggle checked={form.feeReminders} onChange={e => set('feeReminders', e.target.checked)} />
                  <div className="settings-toggle-label">
                    <strong>Auto Fee Due Reminders</strong>
                    <span>Send automated payment reminders 7 days, 3 days, and 1 day before deadline.</span>
                  </div>
                </label>

                <label className="settings-toggle-card">
                  <Toggle checked={form.attendanceAlerts} onChange={e => set('attendanceAlerts', e.target.checked)} />
                  <div className="settings-toggle-label">
                    <strong>Low-Attendance Parent Alerts</strong>
                    <span>Auto-notify parents when their child drops below the 75% minimum attendance threshold.</span>
                  </div>
                </label>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
