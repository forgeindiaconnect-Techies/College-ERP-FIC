import React from 'react';
import { FileText, Search, Download } from 'lucide-react';

const Receipts = () => {
  const receipts = [
    { id: 'REC-2605-001', student: 'John Doe (CS2022001)', type: 'Tuition Fee', amount: 45000, date: '2026-05-18', mode: 'NEFT' },
    { id: 'REC-2605-002', student: 'Alice Smith (EE2022002)', type: 'Exam Fee', amount: 2500, date: '2026-05-19', mode: 'Credit Card' },
    { id: 'REC-2605-003', student: 'Robert Brown (ME2022003)', type: 'Hostel Fee', amount: 12000, date: '2026-05-20', mode: 'Cash' },
  ];

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <FileText size={24} className="text-[#3b82f6]" /> Transaction Receipts
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Search, view, and download generated payment receipts.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input type="text" placeholder="Search Receipt ID or Student..." className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg pl-10 pr-4 py-2 outline-none focus:border-[#3b82f6]" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-sm">
                <th className="p-4 font-medium">Receipt No.</th>
                <th className="p-4 font-medium">Student Info</th>
                <th className="p-4 font-medium">Fee Type</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Mode</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((rec, i) => (
                <tr key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="p-4 font-mono text-sm font-semibold text-[var(--text-main)]">{rec.id}</td>
                  <td className="p-4 text-[var(--text-main)] font-medium">{rec.student}</td>
                  <td className="p-4 text-[var(--text-muted)] text-sm">{rec.type}</td>
                  <td className="p-4 text-[var(--text-main)]">{rec.date}</td>
                  <td className="p-4 text-[var(--text-muted)] text-sm">{rec.mode}</td>
                  <td className="p-4 font-bold text-[#10b981]">₹{rec.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <button className="text-[#3b82f6] hover:text-blue-400 flex items-center gap-1 text-sm font-medium transition-colors">
                      <Download size={16} /> PDF
                    </button>
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

export default Receipts;
