import React, { useState, useEffect } from 'react';
import { FileBarChart, Calendar, TrendingUp, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import '../../pages/Dashboard.css';

import { getExams, getAllMarks } from '../../api/index';

const upcomingExams = [
  { code: 'EX2026-01', subject: 'Data Structures', dept: 'CSE', sem: 'Sem 4', date: '2026-06-10', time: '10:00 AM', hall: 'Block A - Hall 1', type: 'Internal', status: 'Scheduled' },
  { code: 'EX2026-02', subject: 'Signals & Systems', dept: 'ECE', sem: 'Sem 4', date: '2026-06-11', time: '10:00 AM', hall: 'Block B - Hall 2', type: 'Semester', status: 'Scheduled' },
  { code: 'EX2026-03', subject: 'Thermodynamics', dept: 'MECH', sem: 'Sem 2', date: '2026-06-12', time: '02:00 PM', hall: 'Block C - Hall 1', type: 'Internal', status: 'Scheduled' },
  { code: 'EX2026-04', subject: 'Compiler Design', dept: 'CSE', sem: 'Sem 6', date: '2026-06-14', time: '10:00 AM', hall: 'Block A - Hall 2', type: 'Semester', status: 'Scheduled' },
  { code: 'EX2026-05', subject: 'Strategic Management', dept: 'MBA', sem: 'Sem 4', date: '2026-06-15', time: '10:00 AM', hall: 'MBA Block - Hall 1', type: 'Semester', status: 'Scheduled' },
];

const resultData = [
  { dept: 'CSE', passRate: 91, failRate: 9, avgScore: 78, topScore: 95, students: 120 },
  { dept: 'ECE', passRate: 88, failRate: 12, avgScore: 74, topScore: 91, students: 98 },
  { dept: 'EEE', passRate: 85, failRate: 15, avgScore: 71, topScore: 89, students: 105 },
  { dept: 'MECH', passRate: 83, failRate: 17, avgScore: 69, topScore: 85, students: 115 },
  { dept: 'BCA', passRate: 90, failRate: 10, avgScore: 76, topScore: 93, students: 80 },
  { dept: 'MBA', passRate: 87, failRate: 13, avgScore: 73, topScore: 90, students: 60 },
];

const trendData = [
  { sem: 'Sem 1', passRate: 80, avgScore: 68 },
  { sem: 'Sem 2', passRate: 83, avgScore: 71 },
  { sem: 'Sem 3', passRate: 84, avgScore: 72 },
  { sem: 'Sem 4', passRate: 86, avgScore: 74 },
  { sem: 'Sem 5', passRate: 88, avgScore: 76 },
  { sem: 'Sem 6', passRate: 87, avgScore: 75 },
];

const gradeData = [
  { name: 'O (Outstanding)', value: 15, color: '#10b981' },
  { name: 'A+ (Excellent)', value: 30, color: '#6366f1' },
  { name: 'A (Very Good)', value: 28, color: '#8b5cf6' },
  { name: 'B+ (Good)', value: 18, color: '#f59e0b' },
  { name: 'B (Average)', value: 6, color: '#0ea5e9' },
  { name: 'Failed', value: 3, color: '#ef4444' },
];

const failedStudents = [
  { name: 'Robert Johnson', dept: 'MECH', subject: 'Engineering Math', marks: 32, maxMarks: 100, sem: 'Sem 2', arrears: 1 },
  { name: 'Neha Gupta', dept: 'ECE', subject: 'Analog Circuits', marks: 38, maxMarks: 100, sem: 'Sem 6', arrears: 1 },
  { name: 'David Lee', dept: 'CSE', subject: 'Computer Networks', marks: 42, maxMarks: 100, sem: 'Sem 3', arrears: 1 },
];

export default function PrincipalExamsResults() {
  const [tab, setTab] = useState('schedule');
  const [exams, setExams] = useState([]);
  const [arrearList, setArrearList] = useState(failedStudents);

  useEffect(() => {
    // 1. Fetch dynamic exams
    getExams()
      .then(res => {
        if (res?.data && res.data.length > 0) {
          setExams(res.data);
        } else {
          setExams(upcomingExams);
        }
      })
      .catch(() => {
        setExams(upcomingExams);
      });

    // 2. Fetch arrears results
    getAllMarks()
      .then(res => res.data)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Process failed arrears
          const arrears = data
            .filter(r => r.grade === 'F' || r.marks < 40)
            .map(r => ({
              name: r.studentName || 'Student',
              dept: r.dept || r.department || 'CSE',
              subject: r.subject || 'Core Engineering',
              marks: r.marks || 35,
              maxMarks: 100,
              sem: r.semester || 'Sem 4',
              arrears: 1
            }));
          if (arrears.length > 0) {
            setArrearList(arrears);
          }
        }
      })
      .catch(err => {
        console.warn('API /api/results offline. Loading security exam ledger.', err);
      });
  }, []);

  const overall = Math.round(resultData.reduce((a, d) => a + d.passRate, 0) / resultData.length);
  const topDept = resultData.reduce((a, d) => d.passRate > a.passRate ? d : a);

  return (
    <div className="main-content" style={{ padding: '2rem', background: 'var(--bg-primary)', minHeight: 'calc(100vh - 70px)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileBarChart style={{ color: '#8b5cf6' }} size={28} /> Exam & Results
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upcoming exam schedule, pass/fail analytics, grade distribution, and top performers.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Upcoming Exams', value: exams.length, icon: <Calendar size={18} />, color: '#6366f1', sub: 'This month' },
          { label: 'Overall Pass %', value: `${overall}%`, icon: <CheckCircle size={18} />, color: '#10b981', sub: 'All departments' },
          { label: 'Failed Students', value: arrearList.length, icon: <AlertCircle size={18} />, color: '#ef4444', sub: 'Active arrears' },
          { label: 'Top Department', value: topDept.dept, icon: <Star size={18} />, color: '#f59e0b', sub: `${topDept.passRate}% pass rate` },
          { label: 'Avg Score', value: `${Math.round(resultData.reduce((a, d) => a + d.avgScore, 0) / resultData.length)}%`, icon: <TrendingUp size={18} />, color: '#8b5cf6', sub: 'Campus-wide' },
          { label: 'Total Students', value: resultData.reduce((a, d) => a + d.students, 0), icon: <FileBarChart size={18} />, color: '#0ea5e9', sub: 'Appeared for exams' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderBottom: `3px solid ${s.color}` }}>
            <div className="stat-icon-wrapper" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-details">
              <h3>{s.label}</h3>
              <p className="stat-value">{s.value}</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass-card" style={{ padding: '0.4rem', borderRadius: 12, display: 'inline-flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {[['schedule', '📅 Exam Schedule'], ['results', '📊 Result Analytics'], ['grades', '🏆 Grade Distribution'], ['failed', '⚠️ Failed Students']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '0.55rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, background: tab === key ? '#8b5cf6' : 'transparent', color: tab === key ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {/* Exam Schedule */}
      {tab === 'schedule' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderRadius: 16 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '1rem' }}>Upcoming Examinations</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Exam Code</th><th>Subject</th><th>Department</th><th>Semester</th><th>Date & Time</th><th>Hall</th><th>Type</th><th>Status</th></tr>
              </thead>
              <tbody>
                {exams.map((e, i) => {
                  const examCode = e._id ? `EX-${e._id.substring(e._id.length - 6).toUpperCase()}` : (e.code || `EX-${100 + i}`);
                  const examType = e.name || e.type || 'Internal';
                  return (
                    <tr key={e._id || e.id || i}>
                      <td style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '0.82rem' }}>{examCode}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{e.subject}</td>
                      <td><span style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', padding: '2px 7px', borderRadius: 5, fontSize: '0.72rem', fontWeight: 700 }}>{e.dept}</span></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{e.sem || 'Sem 4'}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.82rem' }}>{e.date}</div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{e.time}</span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.room || e.hall || 'Seminar Hall'}</td>
                      <td>
                        <span style={{ background: examType.includes('Sem') || examType.includes('Theory') ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)', color: examType.includes('Sem') || examType.includes('Theory') ? '#6366f1' : '#f59e0b', padding: '2px 7px', borderRadius: 5, fontSize: '0.72rem', fontWeight: 700 }}>{examType}</span>
                      </td>
                      <td>
                        <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>{e.status || 'Scheduled'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result Analytics */}
      {tab === 'results' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem' }}>Department Pass vs Fail %</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={resultData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="passRate" fill="#10b981" name="Pass %" radius={[5, 5, 0, 0]} />
                <Bar dataKey="failRate" fill="#ef4444" name="Fail %" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem' }}>Pass Rate Trend (Semester-wise)</h4>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sem" tick={{ fontSize: 10 }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="passRate" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="Pass Rate %" />
                <Line type="monotone" dataKey="avgScore" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Avg Score %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grade Distribution */}
      {tab === 'grades' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem' }}>Grade Distribution (All Students)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={gradeData} dataKey="value" cx="50%" cy="50%" outerRadius={110} innerRadius={55} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {gradeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 16 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem' }}>Grade Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {gradeData.map(g => (
                <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: g.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{g.name}</span>
                  <div style={{ width: 120, height: 8, background: 'var(--bg-secondary)', borderRadius: 4 }}>
                    <div style={{ width: `${g.value * 3}%`, height: '100%', background: g.color, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', width: 30, textAlign: 'right' }}>{g.value}%</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', background: 'rgba(16,185,129,0.06)', borderRadius: 10, padding: '1rem', borderLeft: '3px solid #10b981' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>HIGHEST PERFORMERS</div>
              {[{ name: 'Sarah Wilson', cgpa: 9.5, dept: 'EEE' }, { name: 'Alice Smith', cgpa: 9.1, dept: 'EEE' }, { name: 'Ritu Sen', cgpa: 9.2, dept: 'MBA' }].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>#{i + 1} {s.name}</span>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>{s.cgpa} CGPA</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Failed Students */}
      {tab === 'failed' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderRadius: 16 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '1rem' }}>⚠️ Students with Active Arrears</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Student Name</th><th>Department</th><th>Subject</th><th>Semester</th><th>Marks Obtained</th><th>Arrears</th><th>Action</th></tr>
              </thead>
              <tbody>
                {arrearList.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</td>
                    <td><span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 7px', borderRadius: 5, fontSize: '0.72rem', fontWeight: 700 }}>{s.dept}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.subject}</td>
                    <td style={{ fontSize: '0.82rem' }}>{s.sem}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.9rem' }}>{s.marks}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/{s.maxMarks}</span>
                    </td>
                    <td>
                      <span style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>{s.arrears} Arrear</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ padding: '4px 8px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 5, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Notify</button>
                        <button style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', borderRadius: 5, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Counsel</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
