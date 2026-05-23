import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter, Mail, CheckCircle2 } from 'lucide-react';
import { getAllFees, updateFee } from '../../api/index';

const PendingFees = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Departments');
  const [rawFees, setRawFees] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  const loadPendingFees = async () => {
    try {
      const res = await getAllFees();
      if (res?.data) {
        setRawFees(res.data);
      }
    } catch (err) {
      console.error('Failed to load pending fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingFees();
  }, []);

  const handleCollect = async (fee) => {
    try {
      const payload = {
        ...fee,
        paidAmount: fee.totalFees,
        pendingAmount: 0,
        status: 'Paid',
        paymentDate: new Date()
      };
      const res = await updateFee(fee._id, payload);
      if (res?.status === 200) {
        setSuccessMsg(`Successfully cleared dues of ₹${(fee.pendingAmount ?? fee.totalFees).toLocaleString()} for ${fee.studentName || fee.studentId}!`);
        await loadPendingFees();
        setTimeout(() => setSuccessMsg(''), 2000);
      }
    } catch (err) {
      console.error('Failed to clear pending fee:', err);
    }
  };

  // Keep only Pending or Partial
  const pendingItems = rawFees.filter(f => f.status !== 'Paid');

  // Apply department filter
  const filteredPending = pendingItems.filter(item => {
    if (filter === 'All Departments') return true;
    const deptCode = item.department || '';
    return deptCode.toLowerCase() === filter.toLowerCase() || 
           (filter === 'CS' && deptCode.toLowerCase().includes('computer')) ||
           (filter === 'EE' && deptCode.toLowerCase().includes('electrical')) ||
           (filter === 'ME' && deptCode.toLowerCase().includes('mechanical'));
  });

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <AlertTriangle size={24} className="text-[#ef4444]" /> Pending Fees
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Track and manage overdue student payments.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <select 
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg pl-9 pr-8 py-2 outline-none appearance-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All Departments</option>
              <option>CS</option>
              <option>EE</option>
              <option>ME</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] font-medium rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <Mail size={16} /> Remind All
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/20 text-[#10b981] rounded-lg border border-emerald-500/30 flex items-center gap-2 font-semibold">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm">
                <th className="p-4 font-medium">Student ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Dept/Sem</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Amount Due</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    <span className="student-spinner">Loading outstanding dues...</span>
                  </td>
                </tr>
              ) : filteredPending.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                    No outstanding pending invoices found in ledger database.
                  </td>
                </tr>
              ) : (
                filteredPending.map((item, i) => (
                  <tr key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="p-4 font-mono text-sm text-[var(--text-muted)]">{item.studentId}</td>
                    <td className="p-4 text-[var(--text-main)] font-medium">{item.studentName || item.studentId}</td>
                    <td className="p-4 text-[var(--text-muted)] text-sm">{item.department || 'CSE'} - {item.semester || 'Sem 6'}</td>
                    <td className="p-4 text-[#ef4444] font-medium">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-CA') : '2026-05-28'}</td>
                    <td className="p-4 font-bold text-[var(--text-main)]">₹{(item.pendingAmount ?? item.totalFees).toLocaleString()}</td>
                    <td className="p-4 flex gap-2">
                      <button className="px-3 py-1 bg-[#3b82f6]/10 text-[#3b82f6] text-xs font-semibold rounded hover:bg-[#3b82f6]/20 transition-colors">
                        Remind
                      </button>
                      <button 
                        onClick={() => handleCollect(item)}
                        className="px-3 py-1 bg-[#10b981]/10 text-[#10b981] text-xs font-semibold rounded hover:bg-[#10b981]/20 transition-colors"
                      >
                        Collect
                      </button>
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

export default PendingFees;
