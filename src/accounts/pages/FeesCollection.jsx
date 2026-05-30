import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, CheckCircle2, AlertCircle, User, X, Printer, UserPlus } from 'lucide-react';
import { getStudents, createFee, createStudent } from '../../api/index';

const printReceipt = (student, receiptNo, feeType, semester, amount, paymentMode) => {
  const win = window.open('', '_blank', 'width=700,height=650');
  win.document.write(`
    <!DOCTYPE html><html><head><title>Receipt ${receiptNo}</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; background:#fff; color:#111; }
      .header { text-align:center; border-bottom:3px solid #f59e0b; padding-bottom:20px; margin-bottom:24px; }
      .header h1 { margin:0; color:#f59e0b; font-size:26px; } .header p { margin:4px 0; color:#555; font-size:13px; }
      .badge { display:inline-block; background:#10b981; color:white; padding:6px 18px; border-radius:20px; font-size:13px; font-weight:700; margin:12px 0; }
      .row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px dashed #e0e0e0; font-size:14px; }
      .row .label { color:#666; } .row .value { font-weight:600; }
      .amount { font-size:32px; font-weight:800; color:#10b981; text-align:center; margin:24px 0; }
      .footer { text-align:center; margin-top:36px; font-size:11px; color:#999; border-top:1px solid #eee; padding-top:16px; }
    </style></head><body>
    <div class="header"><h1>🎓 College ERP System</h1><p>Finance & Accounts Department</p><p>Official Fee Payment Receipt</p></div>
    <div class="badge">✓ RECEIPT NO: ${receiptNo}</div>
    <div class="row"><span class="label">Student Name</span><span class="value">${student.name}</span></div>
    <div class="row"><span class="label">Student ID</span><span class="value">${student.id}</span></div>
    <div class="row"><span class="label">Department</span><span class="value">${student.dept || student.department || 'N/A'}</span></div>
    <div class="row"><span class="label">Semester</span><span class="value">${semester}</span></div>
    <div class="row"><span class="label">Fee Type</span><span class="value">${feeType}</span></div>
    <div class="row"><span class="label">Payment Mode</span><span class="value">${paymentMode}</span></div>
    <div class="row"><span class="label">Date</span><span class="value">${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</span></div>
    <div class="amount">₹${Number(amount).toLocaleString()}</div>
    <div class="footer"><p>This is a computer-generated receipt. No signature required.</p><p>Generated on ${new Date().toLocaleString()}</p></div>
    </body></html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 600);
};

const FeesCollection = () => {
  const [query, setQuery]               = useState('');
  const [allStudents, setAllStudents]   = useState([]);
  const [suggestions, setSuggestions]   = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [successMsg, setSuccessMsg]     = useState('');
  const [errorMsg, setErrorMsg]         = useState('');
  const [lastReceipt, setLastReceipt]   = useState(null);

  // New Student Modal States
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    dept: 'Computer Science',
    sem: 'Sem 1',
  });
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Payment form
  const [feeType, setFeeType]       = useState('Tuition Fee');
  const [semester, setSemester]     = useState('Sem 6');
  const [amount, setAmount]         = useState(45000);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer (NEFT/RTGS)');
  const [refNo, setRefNo]           = useState('');

  const inputRef = useRef(null);

  const load = async () => {
    try {
      setLoadingStudents(true);
      const res = await getStudents();
      if (res?.data) setAllStudents(res.data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Load all students once on mount
  useEffect(() => {
    load();
  }, []);

  // Live search — filter as user types
  const handleQueryChange = (val) => {
    setQuery(val);
    setSelectedStudent(null);
    setErrorMsg('');
    if (!val.trim()) { setSuggestions([]); return; }
    const q = val.trim().toLowerCase();
    const matches = allStudents.filter(s =>
      s.id.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.dept || '').toLowerCase().includes(q)
    ).slice(0, 6);
    setSuggestions(matches);
  };

  const selectStudent = (s) => {
    setSelectedStudent(s);
    setQuery(s.name);
    setSuggestions([]);
    // Auto-fill semester from student record
    if (s.sem) setSemester(s.sem);
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const generateRegNo = (deptName, existingCount) => {
    const codes = {
      'Computer Science': 'CS',
      'Electrical Engg.': 'EE',
      'Mechanical Engg.': 'ME',
      'Civil Engg.': 'CE',
      'Information Tech.': 'IT',
    };
    const code = codes[deptName] || 'ST';
    const year = new Date().getFullYear();
    return `${code}${year}${String(existingCount + 1).padStart(3, '0')}`;
  };

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    
    if (!regForm.name.trim()) { setRegError('Please enter full name.'); return; }
    if (!regForm.email.trim()) { setRegError('Please enter email address.'); return; }
    
    try {
      const regId = generateRegNo(regForm.dept, allStudents.length);
      const newStudentPayload = {
        id: regId,
        name: regForm.name.trim(),
        email: regForm.email.trim().toLowerCase(),
        phone: regForm.phone.trim() || '9999999999',
        dept: regForm.dept,
        sem: regForm.sem,
        cgpa: 0,
        attendance: 100,
        status: 'Active',
        feeStatus: 'Pending',
      };
      
      const res = await createStudent(newStudentPayload);
      if (res?.status === 201 || res?.status === 200) {
        setRegSuccess(`Successfully registered! Register ID: ${regId}`);
        // Reload student cache so they can be searched later
        await load();
        
        // Auto-select the newly registered student
        setSelectedStudent(res.data);
        setQuery(res.data.name);
        setSemester(res.data.sem || 'Sem 1');
        setAmount(45000); // Set default tuition fee amount
        
        setTimeout(() => {
          setShowRegModal(false);
          setRegSuccess('');
          setRegForm({
            name: '',
            email: '',
            phone: '',
            dept: 'Computer Science',
            sem: 'Sem 1',
          });
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setRegError('Registration failed. Check server log.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setErrorMsg('Please search and select a student first from the list.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const receiptNo = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        department: selectedStudent.dept || selectedStudent.department || 'Computer Science',
        semester,
        totalFees: Number(amount),
        paidAmount: Number(amount),
        paymentMode,
        receiptNo,
        paymentDate: new Date(),
      };
      const res = await createFee(payload);
      if (res?.status === 201 || res?.status === 200) {
        setLastReceipt({ ...payload, receiptNo });
        setSuccessMsg(`✅ Payment recorded! Receipt No: ${receiptNo}`);
        // Auto-print
        printReceipt(selectedStudent, receiptNo, feeType, semester, amount, paymentMode);
        setTimeout(() => {
          setSuccessMsg('');
          setLastReceipt(null);
          clearStudent();
          setRefNo('');
        }, 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to record payment. Check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const step1Done = !!selectedStudent;

  return (
    <div className="animate-fade-in p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
          💳 Fees Collection
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Record student fee payments and auto-generate receipts.
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'28px', flexWrap:'wrap' }}>
        {[
          { num: 1, label: 'Search Student', done: step1Done },
          { num: 2, label: 'Fill Payment Details', done: false },
          { num: 3, label: 'Record & Print Receipt', done: !!successMsg },
        ].map((step, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderRadius:'999px', background: step.done ? 'rgba(16,185,129,0.12)' : 'var(--bg-secondary)', border: `1px solid ${step.done ? '#10b981' : 'var(--border-color)'}`, color: step.done ? '#10b981' : 'var(--text-muted)', fontSize:'0.85rem', fontWeight:600 }}>
            <span style={{ width:'22px', height:'22px', borderRadius:'50%', background: step.done ? '#10b981' : 'var(--border-color)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, flexShrink:0 }}>
              {step.done ? '✓' : step.num}
            </span>
            {step.label}
          </div>
        ))}
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div style={{ marginBottom:'20px', padding:'16px 20px', background:'rgba(16,185,129,0.12)', border:'1px solid #10b981', borderRadius:'12px', color:'#10b981', fontWeight:600, display:'flex', alignItems:'center', gap:'10px', fontSize:'1rem' }}>
          <CheckCircle2 size={20} /> {successMsg}
          {lastReceipt && (
            <button onClick={() => printReceipt(selectedStudent || {name:'Student',id:'N/A'}, lastReceipt.receiptNo, feeType, semester, amount, paymentMode)}
              style={{ marginLeft:'auto', background:'#10b981', color:'white', border:'none', borderRadius:'8px', padding:'6px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.85rem', fontWeight:600 }}>
              <Printer size={14} /> Reprint
            </button>
          )}
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div style={{ marginBottom:'20px', padding:'14px 18px', background:'rgba(239,68,68,0.1)', border:'1px solid #ef4444', borderRadius:'12px', color:'#ef4444', fontWeight:600, display:'flex', alignItems:'center', gap:'10px' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'20px' }}>

        {/* LEFT — Student Search */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* STEP 1 — Search Box */}
          <div className="glass-card" style={{ padding:'24px', border: step1Done ? '2px solid #10b981' : '2px solid #3b82f6', position:'relative' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
              <span style={{ background:'#3b82f6', color:'white', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', flexShrink:0 }}>1</span>
              <h3 style={{ margin:0, fontWeight:700, color:'var(--text-main)', fontSize:'1rem' }}>Search Student</h3>
            </div>

            {/* Big visible search input */}
            <div style={{ position:'relative', marginBottom:'8px' }}>
              <Search style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }} size={18} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder={loadingStudents ? "Loading students..." : "Type name or ID (e.g. john)"}
                disabled={loadingStudents}
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  fontSize: '1rem',
                  borderRadius: '10px',
                  border: '2px solid #3b82f6',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: '0 0 0 4px rgba(59,130,246,0.12)',
                }}
              />
              {query && (
                <button onClick={clearStudent} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px' }}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Live Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div style={{ border:'1px solid var(--border-color)', borderRadius:'10px', overflow:'hidden', background:'var(--bg-secondary)', boxShadow:'0 8px 20px rgba(0,0,0,0.12)' }}>
                {suggestions.map((s, i) => (
                  <div
                    key={s.id}
                    onClick={() => selectStudent(s)}
                    style={{
                      padding:'10px 14px',
                      cursor:'pointer',
                      borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                      display:'flex', alignItems:'center', gap:'10px',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'rgba(59,130,246,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <User size={16} style={{ color:'#3b82f6' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight:600, color:'var(--text-main)', fontSize:'0.9rem' }}>{s.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{s.id} · {s.dept} · {s.sem}</div>
                    </div>
                    <span style={{ marginLeft:'auto', fontSize:'0.7rem', padding:'2px 8px', borderRadius:'20px', background: s.feeStatus === 'Paid' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: s.feeStatus === 'Paid' ? '#10b981' : '#f59e0b', fontWeight:600 }}>
                      {s.feeStatus || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {query && suggestions.length === 0 && !selectedStudent && !loadingStudents && (
              <div style={{ marginTop:'12px', textAlign:'center' }}>
                <p style={{ color:'#ef4444', fontSize:'0.85rem', margin:'0 0 8px 0', fontWeight:500 }}>No student found matching "{query}"</p>
                <button
                  type="button"
                  onClick={() => {
                    setRegForm(prev => ({ ...prev, name: query }));
                    setShowRegModal(true);
                  }}
                  style={{ display:'flex', alignItems:'center', gap:'6px', margin:'0 auto', padding:'8px 14px', background:'rgba(59,130,246,0.12)', border:'1px solid #3b82f6', color:'#3b82f6', borderRadius:'8px', fontSize:'0.85rem', fontWeight:600, cursor:'pointer' }}
                >
                  <UserPlus size={14} /> Register "{query}" as New Joiner
                </button>
              </div>
            )}

            {!query && !selectedStudent && (
              <div style={{ marginTop:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
                <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', margin:0 }}>
                  💡 Type any name or ID — results appear instantly
                </p>
                <button
                  type="button"
                  onClick={() => setShowRegModal(true)}
                  style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 12px', background:'var(--bg-secondary)', border:'1px solid var(--border-color)', color:'var(--text-main)', borderRadius:'8px', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s', width:'fit-content' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <UserPlus size={14} className="text-[#10b981]" /> Register New Student
                </button>
              </div>
            )}
          </div>

          {/* Student Card — shows after selection */}
          {selectedStudent ? (
            <div className="glass-card" style={{ padding:'20px', border:'2px solid #10b981' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                <span style={{ background:'#10b981', color:'white', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', flexShrink:0 }}>✓</span>
                <h3 style={{ margin:0, fontWeight:700, color:'#10b981', fontSize:'1rem' }}>Student Verified</h3>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  ['Name', selectedStudent.name],
                  ['Student ID', selectedStudent.id],
                  ['Department', selectedStudent.dept || selectedStudent.department],
                  ['Current Sem', selectedStudent.sem || 'N/A'],
                  ['CGPA', selectedStudent.cgpa || 'N/A'],
                  ['Fee Status', selectedStudent.feeStatus || 'N/A'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display:'flex', justifycontent:'space-between', paddingBottom:'8px', borderBottom:'1px solid var(--border-color)', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>{label}</span>
                    <span style={{ fontWeight:600, color: label === 'Fee Status' ? (val === 'Paid' ? '#10b981' : '#f59e0b') : 'var(--text-main)', fontSize:'0.9rem' }}>{val}</span>
                  </div>
                ))}
              </div>
              <button onClick={clearStudent} style={{ marginTop:'12px', width:'100%', padding:'8px', background:'none', border:'1px solid var(--border-color)', borderRadius:'8px', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.85rem' }}>
                ✕ Change Student
              </button>
            </div>
          ) : (
            <div className="glass-card" style={{ padding:'20px', opacity:0.5 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                <span style={{ background:'var(--border-color)', color:'var(--text-muted)', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', flexShrink:0 }}>2</span>
                <h3 style={{ margin:0, fontWeight:700, color:'var(--text-muted)', fontSize:'1rem' }}>Student Details</h3>
              </div>
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', textAlign:'center', padding:'20px 0' }}>
                👆 Search and click a student above to load their details here
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — Payment Form */}
        <div className="glass-card" style={{ padding:'28px', border: selectedStudent ? '2px solid #10b981' : '1px solid var(--border-color)', opacity: selectedStudent ? 1 : 0.65 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'22px', paddingBottom:'16px', borderBottom:'1px solid var(--border-color)' }}>
            <span style={{ background: selectedStudent ? '#10b981' : 'var(--border-color)', color:'white', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', flexShrink:0 }}>
              {selectedStudent ? '✓' : '2'}
            </span>
            <h3 style={{ margin:0, fontWeight:700, color:'var(--text-main)', fontSize:'1.1rem' }}>Payment Details</h3>
            {!selectedStudent && <span style={{ marginLeft:'auto', color:'#f59e0b', fontSize:'0.8rem', fontWeight:600 }}>⚠ Search a student first</span>}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', marginBottom:'18px' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'6px' }}>Fee Type</label>
                <select value={feeType} onChange={e => setFeeType(e.target.value)}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-main)', fontSize:'0.95rem', outline:'none' }}>
                  <option>Tuition Fee</option>
                  <option>Exam Fee</option>
                  <option>Hostel Fee</option>
                  <option>Transport Fee</option>
                  <option>Library Fine</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'6px' }}>Semester / Year</label>
                <select value={semester} onChange={e => setSemester(e.target.value)}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-main)', fontSize:'0.95rem', outline:'none' }}>
                  {['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:'18px' }}>
              <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'6px' }}>Amount (₹)</label>
              <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
                style={{ width:'100%', padding:'12px 14px', borderRadius:'8px', border:'2px solid #10b981', background:'var(--bg-secondary)', color:'var(--text-main)', fontSize:'1.1rem', fontWeight:700, outline:'none', boxSizing:'border-box' }} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', marginBottom:'18px' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'6px' }}>Payment Method</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-main)', fontSize:'0.95rem', outline:'none' }}>
                  <option>Bank Transfer (NEFT/RTGS)</option>
                  <option>UPI</option>
                  <option>Credit/Debit Card</option>
                  <option>Cash</option>
                  <option>Demand Draft</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'6px' }}>Transaction Ref No.</label>
                <input type="text" value={refNo} onChange={e => setRefNo(e.target.value)}
                  placeholder="Txn ID / DD No (optional)"
                  style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-main)', fontSize:'0.95rem', outline:'none', boxSizing:'border-box' }} />
              </div>
            </div>

            {/* Summary box */}
            {selectedStudent && (
              <div style={{ padding:'16px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'10px', marginBottom:'20px' }}>
                <div style={{ fontWeight:700, color:'var(--text-main)', marginBottom:'8px', fontSize:'0.9rem' }}>📋 Payment Summary</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', fontSize:'0.85rem', color:'var(--text-muted)' }}>
                  <span>Student:</span><span style={{ fontWeight:600, color:'var(--text-main)' }}>{selectedStudent.name}</span>
                  <span>Type:</span><span style={{ fontWeight:600, color:'var(--text-main)' }}>{feeType} — {semester}</span>
                  <span>Amount:</span><span style={{ fontWeight:800, color:'#10b981', fontSize:'1rem' }}>₹{Number(amount).toLocaleString()}</span>
                  <span>Mode:</span><span style={{ fontWeight:600, color:'var(--text-main)' }}>{paymentMode}</span>
                </div>
              </div>
            )}

            <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
              <button type="button" onClick={clearStudent}
                style={{ padding:'11px 22px', borderRadius:'9px', border:'1px solid var(--border-color)', background:'none', color:'var(--text-main)', fontWeight:600, cursor:'pointer', fontSize:'0.95rem' }}>
                Cancel
              </button>
              <button type="submit" disabled={!selectedStudent || submitting}
                style={{ padding:'11px 28px', borderRadius:'9px', border:'none', background: selectedStudent ? 'linear-gradient(to right, #10b981, #059669)' : 'var(--border-color)', color: selectedStudent ? 'white' : 'var(--text-muted)', fontWeight:700, cursor: selectedStudent ? 'pointer' : 'not-allowed', fontSize:'0.95rem', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s' }}>
                {submitting ? '⏳ Processing...' : <><FileText size={17} /> Record Payment & Print Receipt</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* QUICK REGISTER STUDENT MODAL */}
      {showRegModal && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}>
          <div className="glass-card" style={{ width:'450px', padding:'28px', position:'relative', animation:'fadeIn 0.2s ease-out' }}>
            <button onClick={() => setShowRegModal(false)} style={{ position:'absolute', right:'20px', top:'20px', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
              <X size={20} />
            </button>
            
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', borderBottom:'1px solid var(--border-color)', pb:'12px', paddingBottom:'12px' }}>
              <UserPlus style={{ color:'#3b82f6' }} size={24} />
              <div>
                <h3 style={{ margin:0, fontWeight:700, color:'var(--text-main)', fontSize:'1.1rem' }}>Quick Register New Joiner</h3>
                <p style={{ margin:'2px 0 0 0', fontSize:'0.8rem', color:'var(--text-muted)' }}>Add them to database instantly to take payment.</p>
              </div>
            </div>

            {regError && (
              <div style={{ padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid #ef4444', borderRadius:'8px', color:'#ef4444', fontSize:'0.85rem', fontWeight:600, marginBottom:'16px' }}>
                {regError}
              </div>
            )}
            
            {regSuccess && (
              <div style={{ padding:'10px 14px', background:'rgba(16,185,129,0.12)', border:'1px solid #10b981', borderRadius:'8px', color:'#10b981', fontSize:'0.85rem', fontWeight:600, marginBottom:'16px' }}>
                {regSuccess}
              </div>
            )}

            <form onSubmit={handleQuickRegister} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={regForm.name}
                  onChange={e => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-main)', outline:'none', boxSizing:'border-box' }}
                />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'4px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@college.edu"
                  value={regForm.email}
                  onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-main)', outline:'none', boxSizing:'border-box' }}
                />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'12px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'4px' }}>Department *</label>
                  <select
                    value={regForm.dept}
                    onChange={e => setRegForm(prev => ({ ...prev, dept: e.target.value }))}
                    style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-main)', outline:'none' }}
                  >
                    <option>Computer Science</option>
                    <option>Electrical Engg.</option>
                    <option>Mechanical Engg.</option>
                    <option>Civil Engg.</option>
                    <option>Information Tech.</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'4px' }}>Admission Sem *</label>
                  <select
                    value={regForm.sem}
                    onChange={e => setRegForm(prev => ({ ...prev, sem: e.target.value }))}
                    style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-main)', outline:'none' }}
                  >
                    <option>Sem 1</option>
                    <option>Sem 2</option>
                    <option>Sem 3</option>
                    <option>Sem 4</option>
                    <option>Sem 5</option>
                    <option>Sem 6</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'4px' }}>Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={regForm.phone}
                  onChange={e => setRegForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-main)', outline:'none', boxSizing:'border-box' }}
                />
              </div>

              <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'10px', borderTop:'1px solid var(--border-color)', pt:'14px', paddingTop:'14px' }}>
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  style={{ padding:'10px 18px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'none', color:'var(--text-main)', fontWeight:600, cursor:'pointer', fontSize:'0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding:'10px 22px', borderRadius:'8px', border:'none', background:'linear-gradient(to right, #3b82f6, #2563eb)', color:'white', fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}
                >
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesCollection;
