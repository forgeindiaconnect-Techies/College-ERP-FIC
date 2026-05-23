import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { getAttendanceByStudent } from '../../api/index';

const ParentAttendance = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendancePercent, setAttendancePercent] = useState(85);
  const [presentDays, setPresentDays] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  useEffect(() => {
    const s = sessionStorage.getItem('parent_session');
    if (!s) {
      navigate('/parent/login');
      return;
    }
    const parsedSession = JSON.parse(s);
    setSession(parsedSession);

    const loadAttendance = async () => {
      try {
        const res = await getAttendanceByStudent(parsedSession.childId || parsedSession.referenceId || parsedSession._id || parsedSession.id);
        if (res?.data) {
          const records = res.data;
          const presentCount = records.filter(r => r.status?.toLowerCase() === 'present').length;
          const totalDays = records.length;
          const percent = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 85;

          setAttendancePercent(percent);
          setPresentDays(presentCount);
          setAbsentDays(totalDays - presentCount);

          const logs = records.map(r => ({
            date: new Date(r.date).toLocaleDateString('en-CA'),
            status: r.status || 'Present',
            remarks: r.status?.toLowerCase() === 'absent' ? 'Absent recorded by faculty' : '-'
          }));
          logs.sort((a, b) => new Date(b.date) - new Date(a.date));
          setAttendanceLogs(logs);
        }
      } catch (err) {
        console.error('Failed to load child attendance for parent:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [navigate]);

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
          <Calendar size={24} className="text-[#10b981]" /> Child Attendance Record
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Detailed view of {session?.childName || 'your child'}'s daily attendance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-[var(--text-muted)] text-sm">Overall Attendance</span>
          <span className="text-3xl font-bold text-[#10b981]">{attendancePercent}%</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-[var(--text-muted)] text-sm">Days Present (This Sem)</span>
          <span className="text-3xl font-bold text-[var(--text-main)]">{presentDays}</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-[var(--text-muted)] text-sm">Days Absent (This Sem)</span>
          <span className="text-3xl font-bold text-[#ef4444]">{absentDays}</span>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--text-main)]">Recent Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    <span className="student-spinner">Loading child logs...</span>
                  </td>
                </tr>
              ) : attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-[var(--text-muted)]">
                    No child daily attendance logs logged yet.
                  </td>
                </tr>
              ) : (
                attendanceLogs.map((log, i) => (
                  <tr key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="p-4 text-[var(--text-main)] font-medium">{log.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        log.status?.toLowerCase() === 'present' ? 'bg-[#10b981]/10 text-[#10b981]' : 
                        log.status?.toLowerCase() === 'absent' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-[#3b82f6]/10 text-[#3b82f6]'
                      }`}>
                        {log.status?.toLowerCase() === 'present' && <CheckCircle size={14} />}
                        {log.status?.toLowerCase() === 'absent' && <XCircle size={14} />}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-muted)] text-sm">
                      {log.remarks}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentAttendance;
