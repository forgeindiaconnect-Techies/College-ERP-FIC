import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import {
  ClipboardList, AlertCircle, BookOpen, Bell,
  Percent, Calendar, ShieldAlert
} from 'lucide-react';
import { 
  getStudentById, getFeesByStudent, getMarksByStudent
} from '../../api/index';
import './ParentDashboard.css';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [parentSession, setParentSession] = useState(null);
  const [childDetails, setChildDetails] = useState(null);

  useEffect(() => {
    const init = async () => {
      const session = sessionStorage.getItem('parent_session');
      if (!session) {
        navigate('/parent/login');
        return;
      }
      
      const parsedSession = JSON.parse(session);
      setParentSession(parsedSession);

      try {
        const [studentRes, feesRes, marksRes] = await Promise.all([
          getStudentById(parsedSession.childId).catch(() => null),
          getFeesByStudent(parsedSession.childId).catch(() => null),
          getMarksByStudent(parsedSession.childId).catch(() => null)
        ]);

        let dbRecord = studentRes?.data || null;
        if (!dbRecord) {
          dbRecord = {
            id: parsedSession.childId, name: parsedSession.childName, dept: 'Computer Science',
            sem: 'Sem 6', attendance: 85, cgpa: 8.6, status: 'Active', feeStatus: 'Pending',
          };
        }

        // Apply CGPA if marks exist
        if (marksRes?.data?.length > 0) {
          const m = marksRes.data[0];
          dbRecord.cgpa = m.total ? (m.total / 10).toFixed(2) : 8.6;
        }

        // Apply Fee Status
        const feesData = feesRes?.data || [];
        const pendingFee = feesData.find(f => f.status === 'Pending');
        if (pendingFee) {
          dbRecord.feeStatus = 'Pending';
          dbRecord.pendingAmount = pendingFee.amount;
        } else {
          dbRecord.feeStatus = 'Paid';
          dbRecord.pendingAmount = 0;
        }

        setChildDetails(dbRecord);
      } catch (err) {
        console.error('Failed to load parent dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  if (loading || !childDetails) {
    return (
      <div className="parent-loading-container">
        <span className="parent-spinner-large"></span>
      </div>
    );
  }

  // Attendance Trend Data
  const attendanceTrendData = [
    { name: 'Week 1', rate: 80 },
    { name: 'Week 2', rate: 82 },
    { name: 'Week 3', rate: 81 },
    { name: 'Week 4', rate: 85 },
    { name: 'Week 5', rate: childDetails.attendance }
  ];

  // Semester Performance (CGPA) Data
  const cgpaTrendData = [
    { name: 'Sem 1', CGPA: 8.2 },
    { name: 'Sem 2', CGPA: 8.4 },
    { name: 'Sem 3', CGPA: 8.1 },
    { name: 'Sem 4', CGPA: 8.5 },
    { name: 'Sem 5', CGPA: childDetails.cgpa }
  ];

  // Fee Analytics Data
  const feeData = [
    { name: 'Paid', value: 45000, color: '#10b981' },
    { name: 'Pending', value: childDetails.feeStatus === 'Pending' ? (childDetails.pendingAmount || 45000) : 0, color: '#ef4444' }
  ];

  const assignmentsCount = 3; // Mock data since it's not currently fetched from API

  return (
    <div className="parent-dashboard animate-fade-in">
      {/* Welcome Banner */}
      <div className="parent-welcome-banner">
        <div className="banner-left">
          <h1>Welcome, {parentSession?.name}!</h1>
          <p>Here is an overview of {childDetails.name}'s academic progress and alerts.</p>
        </div>
        <div className="parent-badge-number">
          <span>CHILD ID: <strong>{childDetails.id}</strong></span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="parent-metrics-grid">
        <div className="glass-card p-metric-card">
          <div className="metric-icon-p teal"><Percent size={22} /></div>
          <div className="p-metric-details">
            <span className="card-title-p">Child Attendance</span>
            <h2 className="metric-value-p">{childDetails.attendance}%</h2>
            <div className="metric-sub-p text-success">✓ Above 75% threshold</div>
          </div>
        </div>

        <div className="glass-card p-metric-card">
          <div className="metric-icon-p blue"><BookOpen size={22} /></div>
          <div className="p-metric-details">
            <span className="card-title-p">Current CGPA</span>
            <h2 className="metric-value-p">{childDetails.cgpa}</h2>
            <div className="metric-sub-p text-success">Outstanding Academic Record</div>
          </div>
        </div>

        <div className="glass-card p-metric-card">
          <div className="metric-icon-p orange"><AlertCircle size={22} /></div>
          <div className="p-metric-details">
            <span className="card-title-p">Pending Fees</span>
            <h2 className="metric-value-p">
              {childDetails.feeStatus === 'Pending' ? `₹${(childDetails.pendingAmount || 45000).toLocaleString()}` : '₹0'}
            </h2>
            <div className={`metric-sub-p ${childDetails.feeStatus === 'Pending' ? 'text-danger' : 'text-success'}`}>
              {childDetails.feeStatus === 'Pending' ? '⚠ Due by next week' : '✓ Fees Paid'}
            </div>
          </div>
        </div>

        <div className="glass-card p-metric-card">
          <div className="metric-icon-p purple"><Calendar size={22} /></div>
          <div className="p-metric-details">
            <span className="card-title-p">Upcoming Exams</span>
            <h2 className="metric-value-p">2 Exams</h2>
            <div className="metric-sub-p text-muted">Starts May 28, 2026</div>
          </div>
        </div>

        <div className="glass-card p-metric-card">
          <div className="metric-icon-p green"><ClipboardList size={22} /></div>
          <div className="p-metric-details">
            <span className="card-title-p">Assignments Pending</span>
            <h2 className="metric-value-p">{assignmentsCount} Tasks</h2>
            <div className="metric-sub-p text-warning-p">Needs submission</div>
          </div>
        </div>

        <div className="glass-card p-metric-card">
          <div className="metric-icon-p red"><ShieldAlert size={22} /></div>
          <div className="p-metric-details">
            <span className="card-title-p">Leave Status</span>
            <h2 className="metric-value-p">No active requests</h2>
            <div className="metric-sub-p text-muted">All clear</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid-parent">
        {/* Attendance Trend Chart */}
        <div className="glass-card chart-card-p">
          <h3>Attendance Trend</h3>
          <p className="text-muted text-sm">Weekly attendance rate</p>
          <div className="chart-container-p">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attColorParent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#attColorParent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CGPA progression */}
        <div className="glass-card chart-card-p">
          <h3>Semester Performance</h3>
          <p className="text-muted text-sm">CGPA over previous semesters</p>
          <div className="chart-container-p">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cgpaTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                <Bar dataKey="CGPA" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee Analytics */}
        <div className="glass-card chart-card-p">
          <h3>Fee Analytics</h3>
          <p className="text-muted text-sm">Tuition & Exam fee status</p>
          <div className="chart-container-p flex-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={feeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <div className="glass-card p-announcements-card">
        <div className="p-announcements-header">
          <h3><Bell size={18} className="text-primary-p" /> Important Notifications</h3>
          <span className="p-notif-pill">1 NEW</span>
        </div>
        <div className="p-announcement-list">
          <div className="p-announcement-item">
            <span className="p-ann-date">22-May-2026</span>
            <h4 className="p-ann-title">Upcoming Parent-Teacher Meeting</h4>
            <p className="p-ann-desc">A meeting has been scheduled for June 5th to discuss your child's mid-semester performance and academic track.</p>
          </div>
          <div className="p-announcement-item">
            <span className="p-ann-date">15-May-2026</span>
            <h4 className="p-ann-title">Semester Fee Deadline</h4>
            <p className="p-ann-desc">Please clear the pending semester fees before May 28 to ensure your child receives their examination hall ticket.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
