import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, CalendarCheck, TrendingUp, BookOpenCheck,
  AlertTriangle, ArrowRight, Trophy, Activity, Briefcase, Clock,
  Calendar, MapPin, User, ChevronRight, BookOpen, Inbox, FileText, ClipboardList, Megaphone, CheckCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getStudents, getStaff } from '../../api/index';
import useRealtimeSync from '../../hooks/useRealtimeSync';
import './HodDashboard.css';
import CollegeInfoCard from '../../components/common/CollegeInfoCard';

// Default Fallback
const DEFAULT_SESSION = {
  name: 'Prof. Rajan Iyer',
  dept: 'Computer Science',
  deptCode: 'CSE',
  role: 'HOD'
};

const DEPT_CODE_MAP = {
  'Computer Science Engineering': 'CSE',
  'Information Technology': 'IT',
  'Electronics & Communication Engineering': 'ECE',
  'Electrical & Electronics Engineering': 'EEE',
  'Mechanical Engineering': 'MECH',
  'Civil Engineering': 'CIVIL',
  'Artificial Intelligence & Data Science': 'AIDS',
  'Artificial Intelligence & Machine Learning': 'AIML',
  'Cyber Security': 'CYBER',
  'Biomedical Engineering': 'BME',
  'Aeronautical Engineering': 'AERO',
  'Automobile Engineering': 'AUTO',
  'Robotics Engineering': 'ROBOTICS',
  'Chemical Engineering': 'CHEM',
  'Biotechnology Engineering': 'BIOTECH',
  'Computer Science': 'CSE',
  'Electronics & Comm.': 'ECE',
  'Electrical Engg.': 'EE',
  'Mechanical Engg.': 'MECH',
  'Bachelor of Computer App.': 'BCA',
  'Master of Business Admin.': 'MBA'
};

const DEPARTMENT_METRICS = {
  CSE: {
    students: 0, staff: 0, subjects: 0, attendance: 0,
    lowAttendance: 0, pendingLeaves: 0, upcomingExams: 0, performance: 0
  }
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const AVATAR_COLORS = ['bg-gradient-blue', 'bg-gradient-purple', 'bg-gradient-orange', 'bg-gradient-green', 'bg-gradient-teal', 'bg-gradient-pink'];

const HodDashboard = () => {
  const navigate = useNavigate();
            <div className={`hod-stat-icon ${card.color}`}>
              {card.icon}
            </div>
            <div className="hod-stat-details">
              <p className="hod-stat-label">{card.label}</p>
              <p className="hod-stat-value">{card.value}</p>
              <p className="hod-stat-sub text-muted">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Department Analytics Charts */}
      <div className="hod-charts-grid">
        <div className="hod-chart-card">
          <h3>Weekly Scoped Attendance (%)</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceWeek}>
                <defs>
                  <linearGradient id="hodAttGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', boxShadow: 'var(--shadow-md)', fontSize: 12 }} />
                <Area type="monotone" dataKey="pct" name="Attendance %" stroke="var(--primary)" strokeWidth={2.5} fill="url(#hodAttGrad)" dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'white' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hod-chart-card">
          <h3>Semester-wise Avg CGPA</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cgpaTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="sem" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[6, 10]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', boxShadow: 'var(--shadow-md)', fontSize: 12 }} />
                <Line type="monotone" dataKey="avg" name="Avg CGPA" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hod-chart-card">
          <h3>Performance Scoping metrics</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceKPIs} barSize={26}>
                <defs>
                  <linearGradient id="hodPerfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', boxShadow: 'var(--shadow-md)', fontSize: 12 }} />
                <Bar dataKey="value" name="Percentage %" fill="url(#hodPerfGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Quick Actions & Dynamic Activities Log Flow */}
      <div className="hod-charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginTop: '0.2rem' }}>
        {/* Quick Actions Card */}
        <div className="hod-chart-card" style={{ paddingBottom: '1.25rem' }}>
          <h3>⚡ Quick Administrative Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '1rem', height: '100%', minHeight: '140px' }}>
            <button className="hod-btn-primary" style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.65rem' }} onClick={() => navigate('/hod/students')}>
              <Users size={15} /> Register Student
            </button>
            <button className="hod-btn-ghost" style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.65rem' }} onClick={() => navigate('/hod/timetable')}>
              <Calendar size={15} /> Manage Timetable
            </button>
            <button className="hod-btn-ghost" style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.65rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }} onClick={() => navigate('/hod/announcements')}>
              <Megaphone size={15} /> Post News
            </button>
            <button className="hod-btn-primary" style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.65rem', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', border: 'none', boxShadow: '0 4px 10px rgba(245,158,11,0.2)' }} onClick={() => navigate('/hod/leaves')}>
              <Inbox size={15} /> Approve Leaves
            </button>
          </div>
        </div>

        {/* Dynamic Activity Log */}
        <div className="hod-chart-card">
          <h3>📋 Recent Scoped Activities</h3>
          <div style={{ marginTop: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {notifications.length === 0 ? (
                <li style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent activities found</li>
              ) : (
                notifications.map((n, i) => (
                  <li key={n._id || i} style={{ borderLeft: `3px solid ${n.type === 'Warning' ? '#ef4444' : n.type === 'Success' ? '#10b981' : '#f59e0b'}`, paddingLeft: '0.75rem', marginBottom: '0.5rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{n.message}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Scoped Lists & Dynamic Summaries */}
      <div className="hod-lists-row-grid" style={{ marginTop: '0.5rem' }}>
        {/* Top Performers */}
        <div className="hod-list-card glass-card">
          <div className="hod-list-header">
            <h3><Trophy size={16} style={{ color: 'var(--warning)' }} /> Scoped Top Performers</h3>
            <button className="hod-link-btn" onClick={() => navigate('/hod/marks')}>View Marks <ArrowRight size={14} /></button>
          </div>
          <div className="hod-list-content">
            {getToppers().map((s, idx) => (
              <div key={idx} className="hod-list-item">
                <span className="rank-tag">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                <div className={`avatar-xs ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>{s.name[0]}</div>
                <div className="item-info">
                  <p className="item-title">{s.name}</p>
                  <p className="item-subtitle">{s.sem} · {s.id || s.rollNo}</p>
                </div>
                <span className="item-metric font-semibold" style={{ color: getCgpaColor(s.cgpa) }}>{s.cgpa} CGPA</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Attendance Alert */}
        <div className="hod-list-card glass-card">
          <div className="hod-list-header">
            <h3><AlertTriangle size={16} style={{ color: 'var(--danger)' }} /> Scoped Attendance Alert (&lt; 80%)</h3>
            <button className="hod-link-btn" onClick={() => navigate('/hod/students')}>View All <ArrowRight size={14} /></button>
          </div>
          <div className="hod-list-content">
            {getLowAttendanceStudents().map((s, idx) => (
              <div key={idx} className="hod-list-item">
                <div className="avatar-xs bg-gradient-orange">{s.name[0]}</div>
                <div className="item-info">
                  <p className="item-title">{s.name}</p>
                  <p className="item-subtitle">{s.sem} · {s.id || s.rollNo}</p>
                </div>
                <span className="item-metric text-danger font-semibold">{s.attendance}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Workloads */}
        <div className="hod-list-card glass-card">
          <div className="hod-list-header">
            <h3><GraduationCap size={16} style={{ color: 'var(--primary)' }} /> Scoped Faculty list</h3>
            <button className="hod-link-btn" onClick={() => navigate('/hod/staff')}>View All <ArrowRight size={14} /></button>
          </div>
          <div className="hod-list-content">
            {myStaff.length === 0 ? (
              <div className="hod-list-item">
                <p className="text-muted text-sm">No staff found for this department.</p>
              </div>
            ) : myStaff.slice(0, 3).map((s, idx) => (
              <div key={idx} className="hod-list-item">
                <div className={`avatar-xs ${AVATAR_COLORS[(idx + 2) % AVATAR_COLORS.length]}`}>{s.name[0]}</div>
                <div className="item-info">
                  <p className="item-title">{s.name}</p>
                  <p className="item-subtitle">{s.designation || 'Lecturer'}</p>
                </div>
                <span className="item-metric font-semibold text-success">{s.workload || '14'} hrs/wk</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
