import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, Filter, BookDown, CheckCircle, 
  AlertCircle, X, Eye, FileText, Download, QrCode, 
  Library, Clock, ArrowRightLeft, Bell, TrendingUp
} from 'lucide-react';
import { getLibraryBooks, getLibraryIssues, returnLibraryBook, issueLibraryBook } from '../../api/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import './LibraryManagement.css';

// MOCK Data for static tabs
const MOCK_DIGITAL = [
  { id: 'D001', title: 'Data Structures Lecture Notes', author: 'Prof. Davis', type: 'PDF', size: '2.4 MB', downloads: 342 },
  { id: 'D002', title: 'Thermodynamics Formula Sheet', author: 'Prof. Wilson', type: 'PDF', size: '1.1 MB', downloads: 156 },
  { id: 'D003', title: 'Basic Electronics Lab Manual', author: 'Dept. of ECE', type: 'PDF', size: '5.6 MB', downloads: 890 },
];

const MOCK_RESERVATIONS = [
  { resId: 'RES-001', studentName: 'John Doe', regNo: 'CS2021001', bookTitle: 'The C Programming Language', reqDate: '2024-03-20', status: 'Pending' },
  { resId: 'RES-002', studentName: 'Emily Davis', regNo: 'CS2021004', bookTitle: 'Introduction to Algorithms', reqDate: '2024-03-21', status: 'Approved' },
  { resId: 'RES-003', studentName: 'Robert Johnson', regNo: 'ME2023001', bookTitle: 'Engineering Mechanics', reqDate: '2024-03-19', status: 'Pending' }
];

const MOCK_CHART_DATA = [
  { month: 'Aug', issued: 420 }, { month: 'Sep', issued: 380 },
  { month: 'Oct', issued: 590 }, { month: 'Nov', issued: 610 },
  { month: 'Dec', issued: 280 }, { month: 'Jan', issued: 450 },
];

const CATEGORIES = ['All Categories', 'Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Mathematics', 'Software Engg'];

const LibraryManagement = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBookToIssue, setSelectedBookToIssue] = useState(null);
  const [issueFormData, setIssueFormData] = useState({ studentName: '', regNo: '', dueDate: '' });
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const [booksRes, issuesRes] = await Promise.all([
        getLibraryBooks(),
        getLibraryIssues()
      ]);
      setBooks(booksRes.data);
      setIssues(issuesRes.data);
    } catch (error) {
      console.error('Failed to load library data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (issueId, studentName) => {
    try {
      await returnLibraryBook(issueId, { condition: 'Good' });
      alert(`Successfully approved return for ${studentName}!`);
      fetchLibraryData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to return book');
    }
  };

  const handleOpenIssueModal = (book) => {
    setSelectedBookToIssue(book);
    setIssueFormData({ studentName: '', regNo: '', dueDate: '' });
    setShowIssueModal(true);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      await issueLibraryBook({
        bookId: selectedBookToIssue.bookId,
        studentName: issueFormData.studentName,
        regNo: issueFormData.regNo,
        dueDate: issueFormData.dueDate
      });
      alert('Successfully issued book!');
      setShowIssueModal(false);
      fetchLibraryData();
      setActiveTab('Issue & Return');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue book');
    }
  };

  const TABS = ['Dashboard', 'Books Catalog', 'Issue & Return', 'Reservations', 'Digital Library', 'Reports'];

  const filteredBooks = books.filter(b => 
    (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())) &&
    (categoryFilter === 'All Categories' || b.category === categoryFilter)
  );

  const totalBooks = books.reduce((acc, curr) => acc + curr.copies, 0);
  const totalAvailable = books.reduce((acc, curr) => acc + curr.available, 0);
  const totalIssued = issues.filter(i => i.status !== 'Returned').length;
  const totalOverdue = issues.filter(i => i.status === 'Overdue').length;

  if (loading) return <div className="p-8 text-center text-muted">Loading Library Database...</div>;

  return (
    <div className="library-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Advanced Library Management 📚</h1>
          <p className="text-muted">Manage books, issues, digital resources, and auto-calculate fines.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary shadow-glow" onClick={() => alert('Opening barcode scanner...')}>
            <QrCode size={16}/> Scan Barcode
          </button>
        </div>
      </div>

      <div className="lib-tabs-container">
        {TABS.map(tab => (
          <button key={tab} className={`lib-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'Dashboard' && <Library size={16} />}
            {tab === 'Books Catalog' && <BookOpen size={16} />}
            {tab === 'Issue & Return' && <ArrowRightLeft size={16} />}
            {tab === 'Reservations' && <Clock size={16} />}
            {tab === 'Digital Library' && <FileText size={16} />}
            {tab === 'Reports' && <BarChart size={16} />}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Dashboard' && (
        <div className="lib-tab-content animate-fade-in">
          <div className="lib-kpi-grid">
            <div className="glass-card p-5 relative overflow-hidden">
              <BookOpen size={24} className="text-blue-500 mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Total Books</h3>
              <p className="text-2xl font-bold mt-1">{totalBooks}</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <ArrowRightLeft size={24} className="text-purple-500 mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Currently Issued</h3>
              <p className="text-2xl font-bold mt-1">{totalIssued}</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <CheckCircle size={24} className="text-success mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Available</h3>
              <p className="text-2xl font-bold mt-1">{totalAvailable}</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <AlertCircle size={24} className="text-danger mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Overdue Books</h3>
              <p className="text-2xl font-bold text-danger mt-1">{totalOverdue}</p>
            </div>
          </div>

          <div className="lib-charts-row mt-4">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp size={18}/> Monthly Issue Trends</h3>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)"/>
                    <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false}/>
                    <YAxis stroke="var(--text-muted)" tickLine={false}/>
                    <Tooltip contentStyle={{background:'var(--bg-secondary)', border:'none', borderRadius:'8px', color:'var(--text-main)'}}/>
                    <Line type="monotone" dataKey="issued" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
              <BookDown size={48} className="text-primary mb-4 opacity-50"/>
              <h3 className="text-lg font-bold mb-2">Most Borrowed Book</h3>
              <p className="text-xl text-primary font-bold">Introduction to Algorithms</p>
              <p className="text-muted mt-2">Issued 145 times this semester</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Books Catalog' && (
        <div className="lib-tab-content animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <div className="search-box">
                <Search size={16} className="text-muted"/>
                <input type="text" placeholder="Search by title, author, or ISBN..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <div className="flex items-center gap-2 bg-primary-light border border-primary px-3 rounded-lg cursor-pointer">
                 <Filter size={14}/>
                 <select className="bg-transparent border-none outline-none font-medium" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
                   {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                 </select>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Book</button>
          </div>

          <div className="books-grid">
            {filteredBooks.map(b => (
              <div key={b.id} className="glass-card book-card">
                <div className="book-cover">
                  <BookOpen size={32} className="text-muted opacity-50"/>
                </div>
                <div className="book-info">
                  <div>
                    <h3 className="book-title">{b.title}</h3>
                    <p className="book-author">{b.author}</p>
                    <div className="book-status">
                      <span className={`status-badge ${b.available > 0 ? 'status-available' : 'status-issued'}`}>
                        {b.available > 0 ? `${b.available} Available` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  <div className="book-actions">
                    <button className="flex-1 btn-primary text-xs py-1 px-2" disabled={b.available === 0} onClick={()=>handleOpenIssueModal(b)}>Issue</button>
                    <button className="flex-1 btn-secondary text-xs py-1 px-2">Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddModal && (
            <div className="modal-overlay" onClick={()=>setShowAddModal(false)}>
              <div className="modal-box glass-card" onClick={e=>e.stopPropagation()}>
                <div className="modal-hd">
                  <h2>Add New Book</h2>
                  <button className="modal-close-btn" onClick={()=>setShowAddModal(false)}><X size={20}/></button>
                </div>
                <div className="modal-body space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1"><label className="text-sm font-bold text-muted">Title</label><input type="text" className="p-2 rounded border bg-transparent"/></div>
                    <div className="flex flex-col gap-1"><label className="text-sm font-bold text-muted">Author</label><input type="text" className="p-2 rounded border bg-transparent"/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1"><label className="text-sm font-bold text-muted">ISBN</label><input type="text" className="p-2 rounded border bg-transparent"/></div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold text-muted">Category</label>
                      <select className="p-2 rounded border bg-transparent">
                        {CATEGORIES.slice(1).map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1"><label className="text-sm font-bold text-muted">Total Copies</label><input type="number" className="p-2 rounded border bg-transparent"/></div>
                    <div className="flex flex-col gap-1"><label className="text-sm font-bold text-muted">Shelf Location</label><input type="text" className="p-2 rounded border bg-transparent"/></div>
                  </div>
                </div>
                <div className="modal-ft">
                  <button className="btn-ghost" onClick={()=>setShowAddModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={()=>{alert('Book Added!');setShowAddModal(false)}}>Save Book</button>
                </div>
              </div>
            </div>
          )}

          {showIssueModal && selectedBookToIssue && (
            <div className="modal-overlay" onClick={()=>setShowIssueModal(false)}>
              <div className="modal-box glass-card" onClick={e=>e.stopPropagation()}>
                <div className="modal-hd">
                  <h2>Issue Book Form</h2>
                  <button className="modal-close-btn" onClick={()=>setShowIssueModal(false)}><X size={20}/></button>
                </div>
                <form className="modal-body space-y-4" onSubmit={handleIssueSubmit}>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-muted">Book Name</label>
                    <input type="text" className="p-2 rounded border bg-gray-100 dark:bg-gray-800 text-muted" value={selectedBookToIssue.title} readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold text-muted">Student Name</label>
                      <input type="text" required className="p-2 rounded border bg-transparent" value={issueFormData.studentName} onChange={e=>setIssueFormData({...issueFormData, studentName: e.target.value})} placeholder="e.g. John Doe"/>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold text-muted">Register Number</label>
                      <input type="text" required className="p-2 rounded border bg-transparent" value={issueFormData.regNo} onChange={e=>setIssueFormData({...issueFormData, regNo: e.target.value})} placeholder="e.g. CS2022001"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold text-muted">Issue Date</label>
                      <input type="date" className="p-2 rounded border bg-gray-100 dark:bg-gray-800 text-muted" value={new Date().toISOString().split('T')[0]} readOnly />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold text-muted">Return Date</label>
                      <input type="date" required className="p-2 rounded border bg-transparent" value={issueFormData.dueDate} onChange={e=>setIssueFormData({...issueFormData, dueDate: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button type="button" className="btn-secondary" onClick={()=>setShowIssueModal(false)}>Cancel</button>
                    <button type="submit" className="btn-primary flex items-center gap-2"><CheckCircle size={16}/> Confirm Issue</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Issue & Return' && (
        <div className="lib-tab-content animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2>Live Circulation Desk</h2>
            <div className="search-box" style={{maxWidth: '300px'}}>
              <Search size={16} className="text-muted"/>
              <input type="text" placeholder="Search Issue ID or Student..." />
            </div>
          </div>
          <div className="table-wrapper">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Issue ID</th>
                    <th>Book Title</th>
                    <th>Student Info</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status / Fine</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map(issue => (
                    <tr key={issue.issueId} className={issue.status === 'Overdue' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                      <td className="font-mono text-sm">{issue.issueId}</td>
                      <td className="font-medium">{issue.bookTitle}</td>
                      <td>
                        <div className="flex flex-col">
                          <span>{issue.studentName}</span>
                          <span className="text-xs text-muted">{issue.regNo}</span>
                        </div>
                      </td>
                      <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                      <td className={issue.status === 'Overdue' ? 'text-danger font-bold' : ''}>{new Date(issue.dueDate).toLocaleDateString()}</td>
                      <td>
                        {issue.status === 'Overdue' ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-danger font-bold text-xs uppercase px-2 py-1 bg-red-100 rounded inline-block w-max">Overdue</span>
                            <span className="text-sm font-semibold">Fine: ₹{issue.fine}</span>
                          </div>
                        ) : issue.status === 'Returned' ? (
                          <span className="text-gray-500 font-bold text-xs uppercase px-2 py-1 bg-gray-100 rounded inline-block w-max">Returned</span>
                        ) : (
                          <span className="text-success font-bold text-xs uppercase px-2 py-1 bg-green-100 rounded inline-block w-max">Issued</span>
                        )}
                      </td>
                      <td>
                        {issue.status !== 'Returned' ? (
                          <button className="btn-primary text-xs py-1 px-3" onClick={() => handleReturn(issue.issueId, issue.studentName)}>
                            Approve Return
                          </button>
                        ) : (
                          <span className="text-xs text-muted font-bold">Clear</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Digital Library' && (
        <div className="lib-tab-content animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2>E-Books & Lecture Notes</h2>
              <p className="text-sm text-muted">Upload and manage digital resources for students.</p>
            </div>
            <button className="btn-primary">+ Upload PDF</button>
          </div>
          <div className="digital-grid">
            {MOCK_DIGITAL.map(d => (
              <div key={d.id} className="glass-card digital-card">
                <div className="pdf-icon-wrapper">
                  <FileText size={30}/>
                </div>
                <div>
                  <h3 className="digital-title">{d.title}</h3>
                  <p className="text-xs text-muted mt-1">{d.author}</p>
                </div>
                <div className="w-full border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-center text-xs text-muted">
                  <span>{d.size}</span>
                  <span>{d.downloads} Downloads</span>
                </div>
                <button className="w-full btn-secondary text-sm mt-2"><Download size={14} className="inline mr-2"/> Download</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Reservations' && (
        <div className="lib-tab-content animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2>Book Reservations</h2>
            <div className="search-box" style={{maxWidth: '300px'}}>
              <Search size={16} className="text-muted"/>
              <input type="text" placeholder="Search Request ID or Student..." />
            </div>
          </div>
          <div className="table-wrapper">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Req ID</th>
                    <th>Student Info</th>
                    <th>Book Requested</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RESERVATIONS.map(res => (
                    <tr key={res.resId}>
                      <td className="font-mono text-sm">{res.resId}</td>
                      <td>
                        <div className="flex flex-col">
                          <span>{res.studentName}</span>
                          <span className="text-xs text-muted">{res.regNo}</span>
                        </div>
                      </td>
                      <td className="font-medium">{res.bookTitle}</td>
                      <td>{res.reqDate}</td>
                      <td>
                        {res.status === 'Pending' ? (
                          <span className="text-warning font-bold text-xs uppercase px-2 py-1 bg-yellow-100 rounded inline-block w-max">Pending</span>
                        ) : (
                          <span className="text-success font-bold text-xs uppercase px-2 py-1 bg-green-100 rounded inline-block w-max">Approved</span>
                        )}
                      </td>
                      <td>
                        {res.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button className="btn-primary text-xs py-1 px-3" onClick={()=>alert(`Approved reservation for ${res.studentName}!`)}>Approve</button>
                            <button className="btn-secondary text-xs py-1 px-3 text-danger" onClick={()=>alert(`Denied reservation for ${res.studentName}!`)}>Deny</button>
                          </div>
                        )}
                        {res.status === 'Approved' && (
                          <span className="text-xs text-muted">Awaiting Pickup</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Reports' && (
        <div className="lib-tab-content animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2>Library Analytics & Reports</h2>
              <p className="text-sm text-muted">Generate full library circulation history.</p>
            </div>
            <button className="btn-primary flex items-center gap-2"><Download size={16}/> Export Excel</button>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="glass-card p-5">
              <h3 className="text-sm text-muted uppercase font-bold mb-1">Total Fine Collected</h3>
              <p className="text-2xl font-bold text-success">₹ 14,500</p>
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm text-muted uppercase font-bold mb-1">Most Active Dept</h3>
              <p className="text-2xl font-bold text-primary">Computer Science</p>
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm text-muted uppercase font-bold mb-1">Books Lost/Damaged</h3>
              <p className="text-2xl font-bold text-danger">12</p>
            </div>
          </div>

          <div className="table-wrapper">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold">Recent Completed Returns</h3>
              <div className="flex gap-2">
                <select className="p-1 rounded border bg-white dark:bg-gray-800 text-sm">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Semester</option>
                </select>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Issue ID</th>
                    <th>Book Title</th>
                    <th>Student Name</th>
                    <th>Returned On</th>
                    <th>Condition</th>
                    <th>Fine Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono text-sm">IS-088</td>
                    <td className="font-medium">Signals & Systems</td>
                    <td>Neha Gupta</td>
                    <td>2024-03-22</td>
                    <td><span className="text-success text-xs font-bold uppercase">Good</span></td>
                    <td>₹0</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">IS-075</td>
                    <td className="font-medium">Data Structures</td>
                    <td>David Lee</td>
                    <td>2024-03-21</td>
                    <td><span className="text-danger text-xs font-bold uppercase">Damaged</span></td>
                    <td>₹350</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">IS-081</td>
                    <td className="font-medium">Power System Analysis</td>
                    <td>Alice Smith</td>
                    <td>2024-03-20</td>
                    <td><span className="text-success text-xs font-bold uppercase">Good</span></td>
                    <td>₹50</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryManagement;
