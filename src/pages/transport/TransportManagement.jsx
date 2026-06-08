import React, { useState, useEffect } from 'react';
import {
  Bus, Users, Navigation, Plus, Search, Download, 
  CreditCard, UserCheck, ShieldCheck, FileText, BarChart
} from 'lucide-react';
import { getTransportRoutes, getTransportDrivers, getTransportStudents } from '../../api/index';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import './TransportManagement.css';

const CHART_DATA = [
  { month: 'Jul', riders: 320 }, { month: 'Aug', riders: 380 },
  { month: 'Sep', riders: 410 }, { month: 'Oct', riders: 405 },
  { month: 'Nov', riders: 425 }, { month: 'Dec', riders: 440 },
];



const TransportManagement = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [search, setSearch] = useState('');
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [students, setStudents] = useState([]);

  const fetchTransportData = async () => {
    try {
      const [routesRes, driversRes, studentsRes] = await Promise.all([
        getTransportRoutes(),
        getTransportDrivers(),
        getTransportStudents()
      ]);
      setRoutes(routesRes.data);
      setDrivers(driversRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Failed to load transport data', error);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TABS = [
    { name: 'Dashboard', icon: <BarChart size={18} /> },
    { name: 'Routes & Vehicles', icon: <Navigation size={18} /> },
    { name: 'Drivers', icon: <UserCheck size={18} /> },
    { name: 'Student Allocation', icon: <Users size={18} /> },
    { name: 'Reports', icon: <FileText size={18} /> }
  ];

  return (
    <div className="transport-page animate-fade-in">
      <div className="transport-header">
        <h1><Bus size={32} className="text-primary" /> Advanced Transport Management</h1>
        <p className="text-muted mt-2">Manage college fleets, routes, student allocations, and track buses in real-time.</p>
      </div>

      <div className="transport-tabs">
        {TABS.map(tab => (
          <button
            key={tab.name}
            className={`transport-tab ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'Dashboard' && (
        <div className="animate-fade-in">
          <div className="transport-grid">
            <div className="glass-card p-5 relative overflow-hidden">
              <Bus size={24} className="text-blue-500 mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Total Vehicles</h3>
              <p className="text-2xl font-bold mt-1">{routes.length} Buses</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <Navigation size={24} className="text-purple-500 mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Active Routes</h3>
              <p className="text-2xl font-bold mt-1">{routes.length} Routes</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <Users size={24} className="text-success mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Assigned Students</h3>
              <p className="text-2xl font-bold mt-1">{students.length}</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <CreditCard size={24} className="text-danger mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Pending Fees</h3>
              <p className="text-2xl font-bold text-danger mt-1">₹ {students.filter(s=>s.feeStatus==='Pending').reduce((a,b)=>a+b.amount,0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4">Monthly Ridership Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="colorRiders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{background:'var(--bg-secondary)', border:'none', borderRadius:'8px'}}/>
                  <Area type="monotone" dataKey="riders" stroke="#6366F1" fillOpacity={1} fill="url(#colorRiders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Live Fleet Status</h2>
                <span className="text-xs font-bold text-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Live
                </span>
              </div>
              <div className="space-y-4">
                {routes.slice(0, 3).map(route => (
                  <div key={route.routeId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600">
                        <Bus size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{route.name}</p>
                        <p className="text-xs text-muted">{route.vehicle} • {route.driver}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">In Transit</span>
                      <p className="text-xs text-muted mt-1">{route.occupied}/{route.capacity} Seats</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Routes & Vehicles' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Manage Bus Routes</h2>
            <button className="btn-primary flex items-center gap-2"><Plus size={16}/> Create Route</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map(route => (
              <div key={route.routeId} className="glass-card route-card relative">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="font-bold text-lg pr-4">{route.name}</h3>
                  <div className="text-xs font-bold text-primary bg-primary-light px-2 py-1 rounded" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                    {route.routeId}
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted mb-4">
                  <span className="flex items-center gap-2"><Bus size={14}/> {route.vehicle}</span>
                  <span className="flex items-center gap-2"><ShieldCheck size={14}/> {route.driver}</span>
                  <span className="flex items-center gap-2"><Users size={14}/> {route.occupied} / {route.capacity} Allocated</span>
                </div>
                <div className="route-points mt-2">
                  {route.points.map((point, idx) => (
                    <div key={idx} className="point-item text-muted">{point}</div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 btn-secondary py-2 text-xs">Edit Points</button>
                  <button className="flex-1 btn-secondary py-2 text-xs">Change Bus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Student Allocation' && (
        <div className="animate-fade-in">
          <div className="glass-card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <div className="search-box">
                <Search size={16} className="text-muted"/>
                <input type="text" placeholder="Search student or route..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <button className="btn-primary flex items-center gap-2"><Plus size={16}/> Assign Student</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Route Allocated</th>
                    <th>Pickup Point</th>
                    <th>Transport Fee</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(st => (
                    <tr key={st.studentId}>
                      <td className="font-mono text-sm">{st.studentId}</td>
                      <td className="font-medium">{st.name}</td>
                      <td><span className="bg-primary-light text-primary px-2 py-1 rounded text-xs font-bold">{st.routeId}</span></td>
                      <td>{st.pickupPoint}</td>
                      <td>
                        {st.feeStatus === 'Paid' ? (
                          <span className="text-success font-bold text-xs uppercase px-2 py-1 bg-green-100 rounded inline-block">Paid (₹{st.amount})</span>
                        ) : (
                          <span className="text-danger font-bold text-xs uppercase px-2 py-1 bg-red-100 rounded inline-block">Pending (₹{st.amount})</span>
                        )}
                      </td>
                      <td>
                        <button className="btn-secondary text-xs py-1 px-3">Re-allocate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Drivers' && (
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map(driver => (
            <div key={driver.driverId} className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 flex items-center justify-center text-gray-500">
                <UserCheck size={32} />
              </div>
              <h3 className="font-bold text-lg">{driver.name}</h3>
              <p className="text-muted text-sm mb-4">Exp: {driver.experience} • License: {driver.license}</p>
              <div className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded mb-4">
                <p className="text-xs text-muted">Contact: <span className="font-mono text-main">{driver.phone}</span></p>
              </div>
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${driver.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {driver.status}
              </span>
            </div>
          ))}
        </div>
      )}



      {activeTab === 'Reports' && (
        <div className="animate-fade-in glass-card p-12 flex flex-col items-center text-center">
          <FileText size={48} className="text-muted opacity-50 mb-4"/>
          <h2 className="text-xl font-bold mb-2">Transport Reports Generator</h2>
          <p className="text-muted max-w-md mb-6">Export route-wise student lists, fee defaulter reports, and driver attendance logs to Excel.</p>
          <div className="flex gap-4">
            <button className="btn-primary flex items-center gap-2"><Download size={16}/> Student Manifest</button>
            <button className="btn-secondary flex items-center gap-2"><Download size={16}/> Defaulters List</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransportManagement;
