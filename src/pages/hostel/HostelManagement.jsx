import React, { useState } from 'react';
import {
  Building, DoorOpen, Users, UserCheck, Utensils, 
  CreditCard, AlertOctagon, UserPlus, Clock, FileText,
  Plus, Search, BedDouble, CheckCircle, AlertCircle, Phone, Download
} from 'lucide-react';
import { getHostelBlocks, getHostelRooms, getHostelStudents, getHostelComplaints, getStudents } from '../../api/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './HostelManagement.css';

const MOCK_VISITORS = [
  { id: 'V001', name: 'Ramesh Doe', relation: 'Father', student: 'John Doe', inTime: '10:00 AM', outTime: '12:00 PM', date: '2026-05-26' },
];

const MOCK_MESS_MENU = [
  { day: 'Monday', breakfast: 'Idli, Sambar', lunch: 'Rice, Dal, Paneer', dinner: 'Chapati, Mixed Veg' },
  { day: 'Tuesday', breakfast: 'Poha, Jalebi', lunch: 'Rice, Rajma', dinner: 'Chapati, Egg Curry / Dal' },
];

const CHART_DATA = [
  { name: 'Occupied', value: 490, color: '#10b981' },
  { name: 'Available', value: 60, color: '#f59e0b' },
];

const HostelManagement = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [search, setSearch] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchHostelData();

    // Listen for changes from the HOD tab
    const handleStorage = (e) => {
      if (e.key === 'erp_students') fetchHostelData();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const fetchHostelData = async () => {
    try {
      setLoading(true);
      const [blocksRes, roomsRes, studentsRes, complaintsRes, allStudentsRes] = await Promise.all([
        getHostelBlocks().catch(() => ({ data: [] })),
        getHostelRooms().catch(() => ({ data: [] })),
        getHostelStudents().catch(() => ({ data: [] })),
        getHostelComplaints().catch(() => ({ data: [] })),
        getStudents().catch(() => ({ data: [] }))
      ]);
      setBlocks(blocksRes?.data || []);
      setRooms(roomsRes?.data || []);
      
      const adminHostelers = (allStudentsRes?.data || [])
        .filter(s => s.hostelRequired === 'Yes')
        .map(s => ({
            studentId: s.id,
            name: s.name,
            block: 'Pending Allocation',
            room: s.roomNumber || 'Unassigned'
        }));

      // Pull hostel students created locally via HOD portal
      const erpStudents = JSON.parse(localStorage.getItem('erp_students') || '[]');
      const localHostelers = erpStudents
        .filter(s => s.hostelerStatus === 'Hosteler' || s.hostelRequired === 'Yes')
        .map(s => ({
            studentId: s.rollNo || s.id,
            name: s.name,
            block: 'Pending Allocation',
            room: s.roomNumber || 'Unassigned'
        }));

      const backendHostelers = studentsRes?.data || [];
      const combinedHostelers = [...backendHostelers];
      
      [...adminHostelers, ...localHostelers].forEach(lh => {
        if (!combinedHostelers.find(ch => ch.studentId === lh.studentId)) {
          combinedHostelers.push(lh);
        }
      });

      setStudents(combinedHostelers);
      setComplaints(complaintsRes?.data || []);
    } catch (error) {
      console.error('Failed to load hostel data', error);
      // Fallback
      setBlocks([]);
      setRooms([]);
      
      const erpStudents = JSON.parse(localStorage.getItem('erp_students') || '[]');
      setStudents(erpStudents
        .filter(s => s.hostelerStatus === 'Hosteler' || s.hostelRequired === 'Yes')
        .map(s => ({ studentId: s.rollNo || s.id, name: s.name, block: 'Pending Allocation', room: s.roomNumber || 'Unassigned' }))
      );
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const totalCapacity = blocks.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalOccupied = blocks.reduce((acc, curr) => acc + curr.occupied, 0);
  const totalAvailable = totalCapacity - totalOccupied;

  const dynamicChartData = [
    { name: 'Occupied', value: totalOccupied || 1, color: '#10b981' },
    { name: 'Available', value: totalAvailable || 1, color: '#f59e0b' },
  ];

  const TABS = [
    { name: 'Dashboard', icon: <BarChart size={16} /> },
    { name: 'Hostel Blocks', icon: <Building size={16} /> },
    { name: 'Rooms', icon: <DoorOpen size={16} /> },
    { name: 'Student Allocation', icon: <Users size={16} /> },
    { name: 'Wardens', icon: <UserCheck size={16} /> },
    { name: 'Mess Menu', icon: <Utensils size={16} /> },
    { name: 'Hostel Fees', icon: <CreditCard size={16} /> },
    { name: 'Complaints', icon: <AlertOctagon size={16} /> },
    { name: 'Visitors', icon: <UserPlus size={16} /> },
    { name: 'Attendance', icon: <Clock size={16} /> },
    { name: 'Reports', icon: <FileText size={16} /> }
  ];

  return (
    <div className="hostel-page animate-fade-in">
      <div className="hostel-header">
        <h1><Building size={32} className="text-primary" /> Advanced Hostel Management</h1>
        <p className="text-muted mt-2">Manage college accommodations, mess operations, wardens, and daily hostel logistics.</p>
      </div>

      <div className="hostel-tabs">
        {TABS.map(tab => (
          <button
            key={tab.name}
            className={`hostel-tab ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'Dashboard' && (
        <div className="animate-fade-in">
          <div className="hostel-grid">
            <div className="glass-card p-5 relative overflow-hidden">
              <DoorOpen size={24} className="text-blue-500 mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Total Rooms</h3>
              <p className="text-2xl font-bold mt-1">{rooms.length}</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <BedDouble size={24} className="text-green-500 mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Occupied / Available</h3>
              <p className="text-2xl font-bold mt-1">{totalOccupied} / {totalAvailable}</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <Users size={24} className="text-purple-500 mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Hostel Students</h3>
              <p className="text-2xl font-bold mt-1">{students.length}</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <AlertOctagon size={24} className="text-danger mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Pending Complaints</h3>
              <p className="text-2xl font-bold text-danger mt-1">{complaints.filter(c=>c.status==='Pending').length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4">Overall Capacity Status</h2>
              <div className="flex items-center justify-center h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dynamicChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {dynamicChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{background:'var(--bg-secondary)', border:'none', borderRadius:'8px'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {dynamicChartData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{background: d.color}}></span>
                    <span className="text-sm font-bold">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Recent Complaints</h2>
                <button className="text-xs text-primary font-bold">View All</button>
              </div>
              <div className="space-y-4">
                {complaints.slice(0, 3).map(comp => (
                  <div key={comp.complaintId} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{comp.issue}</p>
                      <p className="text-xs text-muted">Room {comp.room} • {comp.student} • {new Date(comp.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${comp.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {comp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Hostel Blocks' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Manage Blocks</h2>
            <button className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Block</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocks.map(block => (
              <div key={block.blockId} className="glass-card p-6 border-t-4 border-primary">
                <h3 className="font-bold text-lg mb-2">{block.name}</h3>
                <p className="text-sm text-muted mb-4 flex items-center gap-2"><UserCheck size={14}/> Warden: {block.warden}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-muted">Occupancy</span>
                  <span className="text-xs font-bold">{block.occupied} / {block.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: `${(block.occupied/block.capacity)*100}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Rooms' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div className="search-box">
              <Search size={16} className="text-muted"/>
              <input type="text" placeholder="Search room number..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Room</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.filter(r => r.roomId.includes(search)).map(room => (
              <div key={room.roomId} className="glass-card room-card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl">{room.roomId}</h3>
                    <p className="text-xs text-muted">{room.block}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${room.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                    {room.status}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <p>Type: <strong>{room.type}</strong></p>
                  <p>Occupied: <strong>{room.occupied}/{room.capacity}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Student Allocation' && (
        <div className="animate-fade-in glass-card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold">Allocated Students</h2>
            <button className="btn-primary flex items-center gap-2"><Plus size={16}/> Allocate Room</button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Block</th>
                  <th>Room</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(st => (
                  <tr key={st.studentId}>
                    <td className="font-mono text-sm">{st.studentId}</td>
                    <td className="font-medium">{st.name}</td>
                    <td>{st.block}</td>
                    <td><span className="bg-primary-light text-primary px-2 py-1 rounded text-xs font-bold">{st.room}</span></td>
                    <td>
                      <button className="btn-secondary text-xs py-1 px-3">Transfer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Mess Menu' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Weekly Mess Menu</h2>
            <button className="btn-secondary flex items-center gap-2">Edit Menu</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_MESS_MENU.map((menu, idx) => (
              <div key={idx} className="mess-menu-day">
                <h3 className="font-bold text-lg text-primary mb-4 border-b pb-2">{menu.day}</h3>
                <div className="mess-meal"><span className="w-20 font-bold text-sm text-muted">Breakfast</span> <span className="text-sm">{menu.breakfast}</span></div>
                <div className="mess-meal"><span className="w-20 font-bold text-sm text-muted">Lunch</span> <span className="text-sm">{menu.lunch}</span></div>
                <div className="mess-meal"><span className="w-20 font-bold text-sm text-muted">Dinner</span> <span className="text-sm">{menu.dinner}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Wardens' && (
        <div className="animate-fade-in glass-card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold">Hostel Wardens</h2>
            <button className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Warden</button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Block Assigned</th>
                  <th>Contact No</th>
                  <th>Shift</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Mr. Ramesh Kumar</td>
                  <td>Block A</td>
                  <td>+91 9876543210</td>
                  <td>Day Shift</td>
                  <td><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span></td>
                </tr>
                <tr>
                  <td className="font-medium">Mrs. Sunita Verma</td>
                  <td>Block B</td>
                  <td>+91 9876543211</td>
                  <td>Night Shift</td>
                  <td><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Hostel Fees' && (
        <div className="animate-fade-in glass-card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold">Fee Defaulters</h2>
            <div className="search-box">
              <Search size={16} className="text-muted"/>
              <input type="text" placeholder="Search student..." />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>Total Fee</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono text-sm">STU1001</td>
                  <td className="font-medium">Aditya Singh</td>
                  <td>₹ 80,000</td>
                  <td>₹ 50,000</td>
                  <td className="text-danger font-bold">₹ 30,000</td>
                  <td><button className="btn-secondary text-xs py-1 px-2">Send Reminder</button></td>
                </tr>
                <tr>
                  <td className="font-mono text-sm">STU1002</td>
                  <td className="font-medium">Neha Gupta</td>
                  <td>₹ 80,000</td>
                  <td>₹ 80,000</td>
                  <td className="text-success font-bold">₹ 0</td>
                  <td><button className="btn-secondary text-xs py-1 px-2">View Receipt</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Complaints' && (
        <div className="animate-fade-in glass-card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold">Maintenance Complaints</h2>
            <button className="btn-primary flex items-center gap-2"><Plus size={16}/> Log Complaint</button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Room</th>
                  <th>Issue</th>
                  <th>Logged By</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(comp => (
                  <tr key={comp.complaintId}>
                    <td className="font-mono text-xs">{comp.complaintId}</td>
                    <td className="font-bold">{comp.room}</td>
                    <td>{comp.issue}</td>
                    <td>{comp.student}</td>
                    <td>{new Date(comp.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${comp.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {comp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Visitors' && (
        <div className="animate-fade-in glass-card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold">Visitor Log</h2>
            <button className="btn-primary flex items-center gap-2"><Plus size={16}/> New Entry</button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Visitor Name</th>
                  <th>Relation</th>
                  <th>Student Name</th>
                  <th>In Time</th>
                  <th>Out Time</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_VISITORS.map(vis => (
                  <tr key={vis.id}>
                    <td>{vis.date}</td>
                    <td className="font-medium">{vis.name}</td>
                    <td>{vis.relation}</td>
                    <td>{vis.student}</td>
                    <td className="font-mono">{vis.inTime}</td>
                    <td className="font-mono">{vis.outTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Attendance' && (
        <div className="animate-fade-in glass-card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold">Night Attendance</h2>
            <input type="date" className="border border-gray-300 dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-800 text-sm" />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Total Students</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>On Leave</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map(block => (
                  <tr key={block.blockId}>
                    <td className="font-bold">{block.name}</td>
                    <td>{block.occupied}</td>
                    <td className="text-success font-bold">{Math.max(0, block.occupied - 2)}</td>
                    <td className="text-danger font-bold">1</td>
                    <td className="text-blue-500 font-bold">1</td>
                    <td><button className="btn-secondary text-xs py-1 px-2">View Absentees</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Reports' && (
        <div className="animate-fade-in glass-card p-12 flex flex-col items-center text-center">
          <FileText size={48} className="text-muted opacity-50 mb-4"/>
          <h2 className="text-xl font-bold mb-2">Hostel Reports</h2>
          <p className="text-muted max-w-md mb-6">Export room occupancy, mess attendance, and fee defaulters data to Excel/PDF.</p>
          <div className="flex gap-4">
            <button className="btn-primary flex items-center gap-2"><Download size={16}/> Occupancy Report</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HostelManagement;
