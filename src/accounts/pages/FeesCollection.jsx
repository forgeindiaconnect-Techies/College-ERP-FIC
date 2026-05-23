import React, { useState } from 'react';
import { Search, Plus, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { getStudents, createFee } from '../../api/index';

const FeesCollection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foundStudent, setFoundStudent] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [feeType, setFeeType] = useState('Tuition Fee');
  const [semester, setSemester] = useState('Sem 6');
  const [amount, setAmount] = useState(45000);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer (NEFT/RTGS)');
  const [refNo, setRefNo] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await getStudents();
      if (res?.data) {
        const query = searchQuery.trim().toLowerCase();
        const match = res.data.find(s => 
          s.id.toLowerCase() === query || 
          s.name.toLowerCase().includes(query)
        );
        if (match) {
          setFoundStudent(match);
          setErrorMsg('');
        } else {
          setFoundStudent(null);
          setErrorMsg('No matching student found.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to lookup student roster.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foundStudent) {
      setErrorMsg('Please look up and load a student details card first.');
      return;
    }

    try {
      const payload = {
        studentId: foundStudent.id,
        studentName: foundStudent.name,
        department: foundStudent.dept || foundStudent.department || 'Computer Science',
        semester: semester,
        totalFees: Number(amount),
        paidAmount: Number(amount),
        paymentMode: paymentMode,
        receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentDate: new Date()
      };

      const res = await createFee(payload);
      if (res?.status === 201 || res?.status === 200) {
        setSuccessMsg(`Receipt generated: ${payload.receiptNo}. Payment logged!`);
        setErrorMsg('');
        setRefNo('');
        setTimeout(() => {
          setSuccessMsg('');
          setFoundStudent(null);
          setSearchQuery('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to write payment to backend ledger.');
    }
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <Plus size={24} className="text-[#10b981]" /> Fees Collection
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Log new fee payments and generate receipts.</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/20 text-[#10b981] rounded-lg border border-emerald-500/30 flex items-center gap-2 font-semibold">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-500/20 text-[#ef4444] rounded-lg border border-rose-500/30 flex items-center gap-2 font-semibold">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-[var(--text-main)] mb-4">Student Lookup</h3>
            <form onSubmit={handleSearch}>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter Student ID or Name..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg pl-10 pr-4 py-2 outline-none focus:border-[#3b82f6]" 
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#3b82f6] text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-[var(--text-main)] mb-4">Student Details</h3>
            {foundStudent ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Name</span>
                  <span className="text-[var(--text-main)] font-medium">{foundStudent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">ID</span>
                  <span className="text-[var(--text-main)] font-mono">{foundStudent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Dept</span>
                  <span className="text-[var(--text-main)] font-medium">{foundStudent.dept || foundStudent.department || 'CSE'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Sem</span>
                  <span className="text-[var(--text-main)] font-medium">{foundStudent.sem || 'Sem 6'}</span>
                </div>
              </div>
            ) : (
              <p className="text-[var(--text-muted)] text-sm text-center py-4">Search a student to display profile card.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-[var(--text-main)] mb-6 border-b border-[var(--border-color)] pb-3">Payment Details</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Fee Type</label>
                <select 
                  value={feeType}
                  onChange={e => setFeeType(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-4 py-2 outline-none focus:border-[#3b82f6]"
                >
                  <option>Tuition Fee</option>
                  <option>Exam Fee</option>
                  <option>Hostel Fee</option>
                  <option>Transport Fee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Semester/Year</label>
                <select 
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-4 py-2 outline-none focus:border-[#3b82f6]"
                >
                  <option>Sem 6</option>
                  <option>Sem 5</option>
                  <option>Sem 4</option>
                  <option>Sem 3</option>
                  <option>Sem 2</option>
                  <option>Sem 1</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Amount (₹)</label>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-4 py-2 outline-none focus:border-[#3b82f6]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Payment Method</label>
                <select 
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-4 py-2 outline-none focus:border-[#3b82f6]"
                >
                  <option>Bank Transfer (NEFT/RTGS)</option>
                  <option>Credit/Debit Card</option>
                  <option>Cash</option>
                  <option>Demand Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Transaction Ref No.</label>
                <input 
                  type="text" 
                  value={refNo}
                  onChange={e => setRefNo(e.target.value)}
                  placeholder="Txn ID / DD No" 
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-4 py-2 outline-none focus:border-[#3b82f6]" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => {
                  setFoundStudent(null);
                  setSearchQuery('');
                }}
                className="px-5 py-2 rounded-lg text-[var(--text-main)] font-medium hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-[#10b981] text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <FileText size={18} /> Record Payment & Print Receipt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeesCollection;
