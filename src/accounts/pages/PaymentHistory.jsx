import React, { useState, useEffect } from 'react';
import { Search, Download, History, CreditCard, Filter, AlertCircle, FileText } from 'lucide-react';
import { getAllFees } from '../../api/index';

const PaymentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('All Methods');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getAllFees();
      if (res?.data) {
        setHistory(res.data.reverse()); // Show newest first
      }
    } catch (err) {
      console.error('Error fetching global payment history:', err);
      // Fallback
      setErrorMsg('Could not fetch live ledger from backend. Displaying offline cache.');
      const cached = localStorage.getItem('erp_fees');
      if (cached) {
        setHistory(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const MODES = ['All Methods', 'Bank Transfer (NEFT/RTGS)', 'Credit/Debit Card', 'Cash', 'Demand Draft'];

  const filteredHistory = history.filter(txn => {
    const s = search.toLowerCase();
    const matchSearch = (txn.studentName || '').toLowerCase().includes(s) || 
                        (txn.studentId || '').toLowerCase().includes(s) || 
                        (txn.receiptNo || '').toLowerCase().includes(s);
    const matchMode = paymentModeFilter === 'All Methods' || txn.paymentMode === paymentModeFilter;
    return matchSearch && matchMode;
  });

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <History size={24} className="text-[#3b82f6]" /> Global Payment Ledger
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Unified view of all incoming student fee transactions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-[var(--border-color)] text-[var(--text-main)] font-medium rounded-lg hover:bg-[var(--bg-secondary)] transition-colors shadow-sm">
          <Download size={18} /> Export Excel
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-amber-500/20 text-[#f59e0b] rounded-lg border border-amber-500/30 flex items-center gap-2 font-semibold">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex flex-wrap gap-4 justify-between items-center bg-[var(--bg-secondary)]">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search Txn ID, Student ID, or Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border border-[var(--border-color)] text-[var(--text-main)] rounded-lg pl-10 pr-4 py-2 outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--text-muted)]" />
            <select 
              value={paymentModeFilter} 
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              className="bg-transparent border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-4 py-2 outline-none focus:border-[#3b82f6]"
            >
              {MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm">
                <th className="p-4 font-medium">Receipt No.</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Student Details</th>
                <th className="p-4 font-medium">Payment Mode</th>
                <th className="p-4 font-medium">Semester/Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">Loading ledger...</td></tr>
              ) : filteredHistory.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">No transactions found matching criteria.</td></tr>
              ) : filteredHistory.map(txn => (
                <tr key={txn._id || txn.receiptNo} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="p-4 font-mono text-sm text-[var(--text-main)] font-semibold">
                    <div className="flex items-center gap-1.5"><FileText size={14} className="text-[#3b82f6]" /> {txn.receiptNo}</div>
                  </td>
                  <td className="p-4 text-[var(--text-main)] text-sm">
                    {new Date(txn.paymentDate || txn.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-[var(--text-main)]">{txn.studentName}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{txn.studentId} • {txn.department}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs font-semibold text-[var(--text-muted)]">
                      <CreditCard size={12}/> {txn.paymentMode}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[var(--text-main)]">
                    {txn.feeType || 'Tuition Fee'} • {txn.semester}
                  </td>
                  <td className="p-4 font-bold text-[#10b981]">₹{(txn.paidAmount || txn.totalFees).toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#10b981]/10 text-[#10b981] rounded text-xs font-bold uppercase tracking-wider">
                      Processed
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

export default PaymentHistory;
