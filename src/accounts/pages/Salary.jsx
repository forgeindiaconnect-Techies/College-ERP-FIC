import React, { useState, useEffect } from 'react';
import { DollarSign, Upload, Download, CheckCircle, Clock, Plus, X, RefreshCw } from 'lucide-react';
import { getSalaries, updateSalary, createSalary } from '../../api/index';

const Salary = () => {
  const [loading, setLoading] = useState(true);
  const [salaries, setSalaries] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    staffId: '', staffName: '', designation: '', department: '',
    billingMonth: 'May 2026', basicPay: '', allowances: '', deductions: '', paymentMode: 'Bank Transfer'
  });

  const loadSalaries = async () => {
    try {
      setLoading(true);
      const res = await getSalaries();
      if (res?.data) setSalaries(res.data);
    } catch (err) {
      console.error('Failed to load salaries:', err);
      setSalaries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSalaries(); }, []);

  // Computed Metrics
  const totalPayroll = salaries.reduce((s, r) => s + (r.netSalary || 0), 0);
  const disbursed   = salaries.filter(r => r.status === 'Disbursed').reduce((s, r) => s + (r.netSalary || 0), 0);
  const pending     = totalPayroll - disbursed;

  const handleDisburse = async (rec) => {
    try {
      await updateSalary(rec._id, { ...rec, status: 'Disbursed', paymentDate: new Date() });
      setSuccessMsg(`✅ Salary disbursed to ${rec.staffName}!`);
      await loadSalaries();
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg('Failed to update salary record.');
      setTimeout(() => setErrorMsg(''), 2500);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const basic = Number(form.basicPay) || 0;
      const allow = Number(form.allowances) || 0;
      const deduct = Number(form.deductions) || 0;
      await createSalary({ ...form, basicPay: basic, allowances: allow, deductions: deduct, netSalary: basic + allow - deduct });
      setSuccessMsg(`✅ Payroll entry added for ${form.staffName}!`);
      setShowForm(false);
      setForm({ staffId: '', staffName: '', designation: '', department: '', billingMonth: 'May 2026', basicPay: '', allowances: '', deductions: '', paymentMode: 'Bank Transfer' });
      await loadSalaries();
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg('Failed to add payroll entry.');
      setTimeout(() => setErrorMsg(''), 2500);
    }
  };

  return (
    <div className="animate-fade-in p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <DollarSign size={24} className="text-[#10b981]" /> Staff Salary & Payroll
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Live payroll records from database — May 2026.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadSalaries} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] font-medium rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} className="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg hover:shadow-lg transition-all">
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </div>

      {successMsg && <div className="mb-4 p-4 bg-emerald-500/20 text-[#10b981] rounded-lg border border-emerald-500/30 font-semibold">{successMsg}</div>}
      {errorMsg   && <div className="mb-4 p-4 bg-rose-500/20 text-[#ef4444] rounded-lg border border-rose-500/30 font-semibold">{errorMsg}</div>}

      {/* Add Entry Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-8 w-full max-w-lg rounded-2xl border border-[var(--border-color)] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--text-main)]">Add Payroll Entry</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-[var(--hover-bg)] rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['staffId','Staff ID'], ['staffName','Staff Name'], ['designation','Designation'], ['department','Department']].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{label}</label>
                    <input required value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-3 py-2 outline-none focus:border-[#10b981]" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[['basicPay','Basic Pay (₹)'], ['allowances','Allowances (₹)'], ['deductions','Deductions (₹)']].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{label}</label>
                    <input type="number" required value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-3 py-2 outline-none focus:border-[#10b981]" />
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center">
                <span className="text-[var(--text-muted)] text-sm">Net Salary: </span>
                <span className="font-bold text-[#10b981] text-lg">₹{((Number(form.basicPay)||0) + (Number(form.allowances)||0) - (Number(form.deductions)||0)).toLocaleString()}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-[var(--text-main)] font-medium hover:bg-[var(--bg-secondary)] transition-colors border border-[var(--border-color)]">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-[#10b981] text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">Add to Payroll</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-[#3b82f6]">
          <span className="text-[var(--text-muted)] text-sm">Total Payroll (May 2026)</span>
          <span className="text-3xl font-bold text-[var(--text-main)]">₹{totalPayroll.toLocaleString()}</span>
          <span className="text-xs text-[var(--text-muted)]">{salaries.length} staff records</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-[#10b981]">
          <span className="text-[var(--text-muted)] text-sm">Amount Disbursed</span>
          <span className="text-3xl font-bold text-[#10b981]">₹{disbursed.toLocaleString()}</span>
          <span className="text-xs text-[#10b981]">{salaries.filter(s => s.status === 'Disbursed').length} staff paid</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-[#f59e0b]">
          <span className="text-[var(--text-muted)] text-sm">Pending Disbursement</span>
          <span className="text-3xl font-bold text-[#f59e0b]">₹{pending.toLocaleString()}</span>
          <span className="text-xs text-[#f59e0b]">{salaries.filter(s => s.status === 'Pending').length} staff pending</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm">
                <th className="p-4 font-medium">Staff ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Role / Dept</th>
                <th className="p-4 font-medium">Basic Pay</th>
                <th className="p-4 font-medium">Allowances</th>
                <th className="p-4 font-medium">Deductions</th>
                <th className="p-4 font-medium">Net Salary</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center text-[var(--text-muted)]">Loading payroll data...</td></tr>
              ) : salaries.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-[var(--text-muted)]">No payroll records found in database.</td></tr>
              ) : salaries.map((staff, i) => (
                <tr key={staff._id || i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="p-4 font-mono text-sm text-[var(--text-muted)]">{staff.staffId}</td>
                  <td className="p-4 text-[var(--text-main)] font-medium">{staff.staffName}</td>
                  <td className="p-4 text-[var(--text-muted)] text-sm">{staff.designation} — {staff.department}</td>
                  <td className="p-4 text-[var(--text-main)]">₹{(staff.basicPay || 0).toLocaleString()}</td>
                  <td className="p-4 text-[#10b981]">₹{(staff.allowances || 0).toLocaleString()}</td>
                  <td className="p-4 text-[#ef4444]">₹{(staff.deductions || 0).toLocaleString()}</td>
                  <td className="p-4 font-bold text-[var(--text-main)]">₹{(staff.netSalary || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      staff.status === 'Disbursed' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                    }`}>
                      {staff.status === 'Disbursed' ? <CheckCircle size={11} /> : <Clock size={11} />}
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {staff.status === 'Pending' ? (
                      <button onClick={() => handleDisburse(staff)}
                        className="px-3 py-1 text-xs font-semibold bg-[#10b981]/10 text-[#10b981] rounded-lg hover:bg-[#10b981]/20 transition-colors flex items-center gap-1">
                        <Upload size={12} /> Disburse
                      </button>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">
                        {staff.paymentDate ? new Date(staff.paymentDate).toLocaleDateString('en-GB') : 'Paid'}
                      </span>
                    )}
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
