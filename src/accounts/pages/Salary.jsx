import React from 'react';
import { DollarSign, Upload, Download, CheckCircle, Clock } from 'lucide-react';

const Salary = () => {
  const staffPayroll = [
    { id: 'STF001', name: 'Dr. Ananya Rao', role: 'HOD', dept: 'CS', basic: 85000, allowance: 15000, total: 100000, status: 'Disbursed' },
    { id: 'STF004', name: 'Prof. Karthik S.', role: 'Staff', dept: 'CS', basic: 65000, allowance: 10000, total: 75000, status: 'Pending' },
    { id: 'STF002', name: 'Prof. Rajan Iyer', role: 'HOD', dept: 'EE', basic: 85000, allowance: 15000, total: 100000, status: 'Disbursed' },
  ];

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <DollarSign size={24} className="text-[#10b981]" /> Staff Salary & Payroll
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Manage monthly payroll disbursement for faculty and staff.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] font-medium rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <Download size={16} /> Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#10b981] to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg transition-all">
            <Upload size={16} /> Disburse Pending
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-[#3b82f6]">
          <span className="text-[var(--text-muted)] text-sm">Total Payroll (May 2026)</span>
          <span className="text-3xl font-bold text-[var(--text-main)]">₹2,75,000</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-[#10b981]">
          <span className="text-[var(--text-muted)] text-sm">Amount Disbursed</span>
          <span className="text-3xl font-bold text-[#10b981]">₹2,00,000</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-[#f59e0b]">
          <span className="text-[var(--text-muted)] text-sm">Pending Disbursement</span>
          <span className="text-3xl font-bold text-[#f59e0b]">₹75,000</span>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm">
                <th className="p-4 font-medium">Staff ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Role/Dept</th>
                <th className="p-4 font-medium">Basic Pay</th>
                <th className="p-4 font-medium">Allowances</th>
                <th className="p-4 font-medium">Net Salary</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {staffPayroll.map((staff, i) => (
                <tr key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="p-4 font-mono text-sm text-[var(--text-muted)]">{staff.id}</td>
                  <td className="p-4 text-[var(--text-main)] font-medium">{staff.name}</td>
                  <td className="p-4 text-[var(--text-muted)] text-sm">{staff.role} - {staff.dept}</td>
                  <td className="p-4 text-[var(--text-main)]">₹{staff.basic.toLocaleString()}</td>
                  <td className="p-4 text-[var(--text-main)]">₹{staff.allowance.toLocaleString()}</td>
                  <td className="p-4 font-bold text-[var(--text-main)]">₹{staff.total.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                      staff.status === 'Disbursed' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                    }`}>
                      {staff.status === 'Disbursed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {staff.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Salary;
