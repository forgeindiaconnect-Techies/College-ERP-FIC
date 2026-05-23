import React, { useState, useEffect } from 'react';
import {
  Search, Filter, DollarSign, TrendingUp, AlertTriangle,
  CheckCircle, X, Download, Eye, Receipt, IndianRupee, Users
} from 'lucide-react';
import { getStudents, getAllFees } from '../../api/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import './FeesManagement.css';

const DEPARTMENTS = ['All','Computer Science','Electrical Engg.','Mechanical Engg.','Civil Engg.','Information Tech.'];
const SEMESTERS   = ['All','Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'];
const PIE_COLORS  = { Paid:'#10b981', Pending:'#ef4444', Partial:'#f59e0b', Waived:'#6366f1' };
const AVATAR_COLORS = ['bg-gradient-blue','bg-gradient-purple','bg-gradient-green','bg-gradient-orange','bg-gradient-pink','bg-gradient-teal'];
const getInitials = n => n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
const fmtCurrency = n => '₹' + Number(n).toLocaleString('en-IN');

const MOCK_FEES = [
  { id:'CS2021001', name:'John Doe',       dept:'Computer Science',  sem:'Sem 6',
    semesterFee:75000, fine:0,    paid:75000, status:'Paid',    dueDate:'2024-03-15',
    payments:[
      { date:'2024-01-10', amount:40000, mode:'Online', txn:'TXN20240110A' },
      { date:'2024-02-05', amount:35000, mode:'Online', txn:'TXN20240205B' },
    ]},
  { id:'EE2022001', name:'Alice Smith',    dept:'Electrical Engg.',  sem:'Sem 4',
    semesterFee:70000, fine:0,    paid:70000, status:'Paid',    dueDate:'2024-03-15',
    payments:[
      { date:'2024-01-08', amount:70000, mode:'DD',     txn:'DD20240108C' },
    ]},
  { id:'ME2023001', name:'Robert Johnson', dept:'Mechanical Engg.',  sem:'Sem 2',
    semesterFee:65000, fine:2500, paid:0,     status:'Pending', dueDate:'2024-03-15',
    payments:[]},
  { id:'CS2021004', name:'Emily Davis',    dept:'Computer Science',  sem:'Sem 6',
    semesterFee:75000, fine:0,    paid:75000, status:'Paid',    dueDate:'2024-03-15',
    payments:[
      { date:'2024-01-12', amount:75000, mode:'Online', txn:'TXN20240112D' },
    ]},
  { id:'CE2020001', name:'Michael Brown',  dept:'Civil Engg.',       sem:'Sem 8',
    semesterFee:62000, fine:3000, paid:35000, status:'Partial', dueDate:'2024-03-15',
    payments:[
      { date:'2024-01-05', amount:35000, mode:'Cash',   txn:'CASH20240105E' },
    ]},
  { id:'EE2022002', name:'Sarah Wilson',   dept:'Electrical Engg.',  sem:'Sem 4',
    semesterFee:70000, fine:0,    paid:70000, status:'Paid',    dueDate:'2024-03-15',
    payments:[
      { date:'2024-01-09', amount:70000, mode:'Online', txn:'TXN20240109F' },
    ]},
  { id:'CS2022001', name:'David Lee',      dept:'Computer Science',  sem:'Sem 3',
    semesterFee:75000, fine:1500, paid:0,     status:'Pending', dueDate:'2024-03-15',
    payments:[]},
  { id:'IT2022001', name:'Priya Sharma',   dept:'Information Tech.', sem:'Sem 5',
    semesterFee:68000, fine:0,    paid:68000, status:'Paid',    dueDate:'2024-03-15',
    payments:[
      { date:'2024-01-11', amount:68000, mode:'Online', txn:'TXN20240111G' },
    ]},
  { id:'ME2023002', name:'Arjun Nair',     dept:'Mechanical Engg.',  sem:'Sem 2',
    semesterFee:65000, fine:1000, paid:40000, status:'Partial', dueDate:'2024-03-15',
    payments:[
      { date:'2024-01-07', amount:40000, mode:'Online', txn:'TXN20240107H' },
    ]},
  { id:'CE2020002', name:'Lakshmi Rao',    dept:'Civil Engg.',       sem:'Sem 8',
    semesterFee:62000, fine:0,    paid:62000, status:'Waived',  dueDate:'2024-03-15',
    payments:[
      { date:'2024-01-01', amount:62000, mode:'Waiver', txn:'WAIVER2024I' },
    ]},
];

const MONTHLY_COLLECTION = [
  { month:'Aug', collected:420000 }, { month:'Sep', collected:380000 },
  { month:'Oct', collected:290000 }, { month:'Nov', collected:510000 },
  { month:'Dec', collected:180000 }, { month:'Jan', collected:350000 },
];

/* ── Receipt generator ── */
const downloadReceipt = (student) => {
  const totalFee = student.semesterFee + student.fine;
  const content = [
    '========================================',
    '         COLLEGE FEE RECEIPT',
    '========================================',
    `Date      : ${new Date().toLocaleDateString('en-IN')}`,
    `Receipt No: RCP-${student.id}-${Date.now().toString().slice(-6)}`,
    '----------------------------------------',
    `Student   : ${student.name}`,
    `Register No: ${student.id}`,
    `Department: ${student.dept}`,
    `Semester  : ${student.sem}`,
    '----------------------------------------',
    `Semester Fee : ${fmtCurrency(student.semesterFee)}`,
    `Fine Amount  : ${fmtCurrency(student.fine)}`,
    `Total Fee    : ${fmtCurrency(totalFee)}`,
    `Paid Amount  : ${fmtCurrency(student.paid)}`,
    `Balance Due  : ${fmtCurrency(Math.max(0, totalFee - student.paid))}`,
    `Status       : ${student.status}`,
    '----------------------------------------',
    'Payment History:',
    ...(student.payments.length
      ? student.payments.map(p => `  ${p.date}  ${p.mode.padEnd(8)}  ${fmtCurrency(p.amount)}  [${p.txn}]`)
      : ['  No payments recorded.']),
    '========================================',
    '     Thank you for your payment!',
    '========================================',
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Receipt_${student.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

const FeesManagement = () => {
  const [loading,       setLoading]       = useState(true);
  const [fees,          setFees]          = useState([]);
  const [search,        setSearch]        = useState('');
  const [deptFilter,    setDeptFilter]    = useState('All');
  const [semFilter,     setSemFilter]     = useState('All');
  const [statusFilter,  setStatusFilter]  = useState('All');
  const [historyModal,  setHistoryModal]  = useState(null); // student object

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [studentsRes, feesRes] = await Promise.all([
        getStudents(),
        getAllFees()
      ]);
      
      const studentList = studentsRes.data;
      const feesList = feesRes.data;
      
      // If db is empty, optionally you can use MOCK_FEES
      let dataToUse = feesList.length > 0 ? feesList : MOCK_FEES;
      
      const studentMap = Object.fromEntries(studentList.map(s => [s.id, s]));
      
      // Merge records
      const mergedRecords = dataToUse.map(f => {
        const s = studentMap[f.studentId] || studentMap[f.id];
        // Ensure defaults mapping for MOCK_FEES vs DB Fees
        return {
          ...f,
          name: s?.name || f.name || 'Unknown',
          dept: s?.dept || f.dept || 'Unknown',
          sem: s?.sem || f.sem || 'Unknown',
          semesterFee: f.totalFees || f.semesterFee || 0,
          fine: f.fine || 0,
          paid: f.paidAmount || f.paid || 0,
          status: f.status || 'Pending',
          payments: f.payments || []
        };
      });
      
      setFees(mergedRecords);
    } catch (err) {
      console.error('Failed to fetch fees:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── derived stats ── */
  const totalCollected = fees.reduce((a,b) => a + b.paid, 0);
  const totalPending   = fees.reduce((a,b) => a + Math.max(0,(b.semesterFee+b.fine)-b.paid), 0);
  const todayCollected = fees.reduce((a,b) => {
    const today = new Date().toISOString().split('T')[0];
    return a + b.payments.filter(p=>p.date===today).reduce((x,y)=>x+y.amount,0);
  }, 0);
  const defaultersCount = fees.filter(f => f.status === 'Pending').length;

  const pieData = ['Paid','Pending','Partial','Waived'].map(s=>({
    name:s, value: fees.filter(f=>f.status===s).length
  })).filter(d=>d.value>0);

  /* ── filtered table rows ── */
  const filtered = fees.filter(f =>
    (f.name.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase())) &&
    (deptFilter   === 'All' || f.dept   === deptFilter)  &&
    (semFilter    === 'All' || f.sem    === semFilter)   &&
    (statusFilter === 'All' || f.status === statusFilter)
  );

  const getFeeClass = s => ({ Paid:'fee-paid', Pending:'fee-pending', Partial:'fee-partial', Waived:'fee-waived' }[s]||'');
  const getBarColor = s => ({ Paid:'var(--success)', Pending:'var(--danger)', Partial:'var(--warning)', Waived:'var(--primary)' }[s]||'var(--primary)');

  return (
    <div className="fees-page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Fees Management</h1>
          <p className="text-muted">Track fee collection, pending payments, fines, and receipt history.</p>
        </div>
        <button className="btn-primary shadow-glow" onClick={() => alert('Export feature coming soon!')}>
          <Download size={16}/> Export Report
        </button>
      </div>

      {/* ── 4 Dashboard Cards ── */}
      <div className="sm-summary-row four-col">
        <div className="sm-summary-card glass-card">
          <IndianRupee size={18} style={{color:'var(--primary)'}}/>
          <span className="sm-summary-label">Total Fees Collected</span>
          <span className="sm-summary-value gradient-text">{fmtCurrency(totalCollected)}</span>
          <span className="card-trend up">↑ Across all students</span>
        </div>
        <div className="sm-summary-card glass-card">
          <AlertTriangle size={18} style={{color:'var(--danger)'}}/>
          <span className="sm-summary-label">Pending Fees</span>
          <span className="sm-summary-value text-danger">{fmtCurrency(totalPending)}</span>
          <span className="card-trend down">Outstanding balance</span>
        </div>
        <div className="sm-summary-card glass-card">
          <TrendingUp size={18} style={{color:'var(--success)'}}/>
          <span className="sm-summary-label">Today's Collection</span>
          <span className="sm-summary-value text-success">{todayCollected > 0 ? fmtCurrency(todayCollected) : '₹0'}</span>
          <span className="card-trend">{new Date().toLocaleDateString('en-IN')}</span>
        </div>
        <div className="sm-summary-card glass-card">
          <Users size={18} style={{color:'var(--danger)'}}/>
          <span className="sm-summary-label">Defaulters Count</span>
          <span className="sm-summary-value text-danger">{defaultersCount}</span>
          <span className="card-trend down">Pending payment students</span>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="fees-charts-row">
        <div className="glass-card chart-box">
          <h3><TrendingUp size={15}/> Monthly Fee Collection</h3>
          <div style={{height:240, marginTop:'1rem'}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_COLLECTION} barSize={30}>
                <defs>
                  <linearGradient id="feesBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5"/><stop offset="100%" stopColor="#7c3aed"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)"/>
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false}/>
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip
                  formatter={v=>[fmtCurrency(v),'Collected']}
                  contentStyle={{borderRadius:8,border:'none',background:'var(--bg-secondary)',color:'var(--text-main)',boxShadow:'var(--shadow-md)',fontSize:12}}
                />
                <Bar dataKey="collected" name="Collected" fill="url(#feesBarGrad)" radius={[5,5,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card chart-box">
          <h3><Receipt size={15}/> Payment Status Breakdown</h3>
          <div style={{height:240, marginTop:'0.4rem'}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="48%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value">
                  {pieData.map(e=><Cell key={e.name} fill={PIE_COLORS[e.name]}/>)}
                </Pie>
                <Tooltip
                  formatter={(v,n)=>[v+' students', n]}
                  contentStyle={{borderRadius:8,border:'none',background:'var(--bg-secondary)',color:'var(--text-main)',boxShadow:'var(--shadow-md)',fontSize:12}}
                />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{fontSize:'0.8rem'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Main Table ── */}
      <div className="glass-card table-wrapper">
        <div className="filters-row">
          <div className="search-box">
            <Search size={16} className="text-muted"/>
            <input type="text" placeholder="Search by name or register no..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {search && <button className="clear-search" onClick={()=>setSearch('')}><X size={14}/></button>}
          </div>
          <div className="filter-group">
            <div className="filter-select-wrapper">
              <Filter size={13} className="text-muted"/>
              <select className="filter-select" value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}>
                <option value="All">All Departments</option>
                {DEPARTMENTS.slice(1).map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="filter-select-wrapper">
              <select className="filter-select" value={semFilter} onChange={e=>setSemFilter(e.target.value)}>
                <option value="All">All Semesters</option>
                {SEMESTERS.slice(1).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-select-wrapper">
              <select className="filter-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option>Paid</option><option>Pending</option><option>Partial</option><option>Waived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Register No</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Total Fees</th>
                <th>Paid Amount</th>
                <th>Pending Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({length:6}).map((_,i)=>(
                <tr key={i}>{Array.from({length:10}).map((_,j)=>(
                  <td key={j}><div className="skeleton" style={{height:14,borderRadius:4,width:j===1?140:j===2?80:60}}/></td>
                ))}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="no-data">No fee records match the active filters.</td></tr>
              ) : filtered.map((f, idx) => {
                const totalFee = f.semesterFee + f.fine;
                const balance  = Math.max(0, totalFee - f.paid);
                const paidPct  = totalFee > 0 ? Math.min(100, Math.round((f.paid / totalFee) * 100)) : 0;
                return (
                  <tr key={f.id} className={f.status === 'Pending' ? 'row-pending' : ''}>
                    <td className="text-muted-sm">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`avatar-sm ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>{getInitials(f.name)}</div>
                        <span className="student-name-cell">{f.name}</span>
                      </div>
                    </td>
                    <td><span className="roll-no">{f.id}</span></td>
                    <td className="dept-cell">{f.dept}</td>
                    <td><span className="badge-outline">{f.sem}</span></td>
                    <td className="font-semibold">{fmtCurrency(totalFee)}</td>
                    <td>
                      <div className="amt-bar-wrap">
                        <span className="text-success font-semibold">{fmtCurrency(f.paid)}</span>
                        <div className="amt-bar-bg">
                          <div className="amt-bar-fill" style={{width:`${paidPct}%`, background:getBarColor(f.status)}}/>
                        </div>
                      </div>
                    </td>
                    <td className={balance > 0 ? 'text-danger font-semibold' : 'text-success font-semibold'}>
                      {fmtCurrency(balance)}
                    </td>
                    <td><span className={`fee-badge ${getFeeClass(f.status)}`}>{f.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="act-btn" title="View Payment History" onClick={()=>setHistoryModal(f)}>
                          <Eye size={14}/>
                        </button>
                        <button className="act-btn download" title="Download Receipt" onClick={()=>downloadReceipt(f)}>
                          <Download size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="table-footer">
            <span>Showing <strong>{filtered.length}</strong> of <strong>{fees.length}</strong> records</span>
            {(deptFilter!=='All'||semFilter!=='All'||statusFilter!=='All'||search) &&
              <button className="clear-filters-link" onClick={()=>{setDeptFilter('All');setSemFilter('All');setStatusFilter('All');setSearch('');}}>
                Reset filters ×
              </button>}
          </div>
        )}
      </div>

      {/* ── Payment History Modal ── */}
      {historyModal && (() => {
        const f = historyModal;
        const totalFee = f.semesterFee + f.fine;
        const balance  = Math.max(0, totalFee - f.paid);
        return (
          <div className="modal-overlay" onClick={()=>setHistoryModal(null)}>
            <div className="modal-box glass-card" onClick={e=>e.stopPropagation()}>
              <div className="modal-hd">
                <div>
                  <h2>Fee Details — {f.name}</h2>
                  <p className="text-muted" style={{fontSize:'0.82rem',marginTop:2}}>{f.id} · {f.dept} · {f.sem}</p>
                </div>
                <button className="modal-close-btn" onClick={()=>setHistoryModal(null)}><X size={20}/></button>
              </div>

              <div className="modal-body">
                {/* Fee Summary Cards */}
                <div className="student-fee-summary">
                  {[
                    { label:'Semester Fee',   value: fmtCurrency(f.semesterFee), color:'var(--text-main)' },
                    { label:'Paid Amount',    value: fmtCurrency(f.paid),        color:'var(--success)'   },
                    { label:'Balance Due',    value: fmtCurrency(balance),       color: balance>0?'var(--danger)':'var(--success)' },
                  ].map((c,i)=>(
                    <div key={i} className="fee-sum-card">
                      <span className="fee-sum-label">{c.label}</span>
                      <span className="fee-sum-value" style={{color:c.color}}>{c.value}</span>
                    </div>
                  ))}
                </div>

                {/* Fine Section */}
                {f.fine > 0 && (
                  <div className="fine-section">
                    <div className="fine-section-title"><AlertTriangle size={14}/> Fine Details</div>
                    <div className="fine-row"><span className="fine-key">Fine Amount</span><span className="fine-val">{fmtCurrency(f.fine)}</span></div>
                    <div className="fine-row"><span className="fine-key">Reason</span><span className="fine-val" style={{color:'var(--text-muted)'}}>Late payment fine</span></div>
                    <div className="fine-row"><span className="fine-key">Total Fee (Incl. Fine)</span><span className="fine-val">{fmtCurrency(totalFee)}</span></div>
                  </div>
                )}

                {/* Payment History */}
                <div>
                  <p className="payment-history-title">Payment History</p>
                  {f.payments.length === 0 ? (
                    <div className="no-history">No payment records found for this student.</div>
                  ) : (
                    <div className="payment-history-list">
                      {f.payments.map((p, i) => (
                        <div key={i} className="payment-hist-item">
                          <div className="pay-icon"><CheckCircle size={15}/></div>
                          <div className="pay-info">
                            <p className="pay-desc">{p.mode} Payment — {p.txn}</p>
                            <p className="pay-date">{new Date(p.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
                          </div>
                          <span className="pay-amount">{fmtCurrency(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-ft">
                <button className="btn-ghost" onClick={()=>setHistoryModal(null)}>Close</button>
                <button className="btn-download" onClick={()=>downloadReceipt(f)}>
                  <Download size={15}/> Download Receipt
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default FeesManagement;
