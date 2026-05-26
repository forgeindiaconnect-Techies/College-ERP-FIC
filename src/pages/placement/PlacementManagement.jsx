import React, { useState } from 'react';
import {
  Briefcase, Building, Target, FileText, Calendar, 
  Users, Award, Search, Plus, MapPin, DollarSign,
  CheckCircle, XCircle, Clock, Download
} from 'lucide-react';
import { getPlacementCompanies, getPlacementJobs, getPlacementApplications, getPlacementInterviews, getPlacementSelections } from '../../api/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import './PlacementManagement.css';

const CHART_DATA = [
  { month: 'Jul', placed: 20 }, { month: 'Aug', placed: 50 },
  { month: 'Sep', placed: 120 }, { month: 'Oct', placed: 250 },
  { month: 'Nov', placed: 310 }, { month: 'Dec', placed: 450 },
];

const PlacementManagement = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchPlacementData();
  }, []);

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      const [compRes, jobsRes, appsRes, intRes, selRes] = await Promise.all([
        getPlacementCompanies(),
        getPlacementJobs(),
        getPlacementApplications(),
        getPlacementInterviews(),
        getPlacementSelections()
      ]);
      setCompanies(compRes.data);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
      setInterviews(intRes.data);
      setSelections(selRes.data);
    } catch (error) {
      console.error('Failed to load placement data', error);
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { name: 'Dashboard', icon: <Target size={16} /> },
    { name: 'Companies', icon: <Building size={16} /> },
    { name: 'Job Openings', icon: <Briefcase size={16} /> },
    { name: 'Eligibility Tracker', icon: <CheckCircle size={16} /> },
    { name: 'Applications', icon: <FileText size={16} /> },
    { name: 'Interviews', icon: <Calendar size={16} /> },
    { name: 'Selected Students', icon: <Award size={16} /> },
    { name: 'Reports', icon: <Download size={16} /> }
  ];

  return (
    <div className="placement-page animate-fade-in">
      <div className="placement-header">
        <h1><Briefcase size={32} className="text-blue-500" /> Advanced Placement Management</h1>
        <p className="text-muted mt-2">Manage campus recruitment drives, company profiles, student applications, and interview schedules.</p>
      </div>

      <div className="placement-tabs">
        {TABS.map(tab => (
          <button
            key={tab.name}
            className={`placement-tab ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'Dashboard' && (
        <div className="animate-fade-in">
          <div className="placement-grid">
            <div className="glass-card p-5 relative overflow-hidden">
              <Building size={24} className="text-blue-500 mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Total Companies</h3>
              <p className="text-2xl font-bold mt-1">{companies.length}</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <Briefcase size={24} className="text-purple-500 mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Active Jobs</h3>
              <p className="text-2xl font-bold mt-1">{jobs.length}</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <Users size={24} className="text-yellow-500 mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Total Applications</h3>
              <p className="text-2xl font-bold mt-1">{applications.length}</p>
            </div>
            <div className="glass-card p-5 relative overflow-hidden">
              <Award size={24} className="text-success mb-2"/>
              <h3 className="text-sm text-muted uppercase font-bold">Students Placed</h3>
              <p className="text-2xl font-bold text-success mt-1">{selections.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4">Placement Trends (YTD)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{background:'var(--bg-secondary)', border:'none', borderRadius:'8px'}}/>
                  <Area type="monotone" dataKey="placed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPlaced)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Upcoming Interviews</h2>
                <button className="text-xs text-primary font-bold">View Calendar</button>
              </div>
              <div className="space-y-4">
                {interviews.map(interview => (
                  <div key={interview.interviewId} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center border-l-4 border-blue-500">
                    <div>
                      <p className="font-bold">{interview.company} - {interview.role}</p>
                      <p className="text-xs text-muted mt-1 flex items-center gap-2">
                        <Calendar size={12}/> {new Date(interview.date).toLocaleDateString()} &nbsp; <Clock size={12}/> {interview.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{interview.round}</span>
                      <p className="text-xs text-muted mt-1">{interview.candidates} Candidates</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Companies' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Partner Companies</h2>
            <button className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Company</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(company => (
              <div key={company.companyId} className="glass-card company-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{company.name}</h3>
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">{company.status}</span>
                </div>
                <p className="text-sm text-muted mb-4">{company.sector}</p>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted"><MapPin size={14}/> {company.location}</div>
                  <div className="flex items-center gap-2 text-muted"><Briefcase size={14}/> {company.drives} Active Drives</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Job Openings' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Active Campus Drives</h2>
            <button className="btn-primary flex items-center gap-2"><Plus size={16}/> Post Job</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map(job => (
              <div key={job.jobId} className="glass-card job-card relative">
                <div className="absolute top-4 right-4 bg-primary-light text-primary px-3 py-1 rounded-full text-xs font-bold">
                  {job.applicants} Applied
                </div>
                <h3 className="font-bold text-xl mb-1">{job.role}</h3>
                <p className="text-primary font-bold mb-4">{job.company}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted block text-xs">CTC Offered</span>
                    <span className="font-bold flex items-center gap-1"><DollarSign size={14}/> {job.ctc}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-xs">Eligibility</span>
                    <span className="font-bold flex items-center gap-1"><CheckCircle size={14}/> {job.eligibility}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                  <span className="text-xs text-danger font-bold flex items-center gap-1"><Clock size={14}/> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  <button className="btn-secondary text-xs py-1">View Applicants</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Applications' && (
        <div className="animate-fade-in glass-card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold">Student Applications</h2>
            <div className="search-box">
              <Search size={16} className="text-muted"/>
              <input type="text" placeholder="Search student or company..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.applicationId}>
                    <td className="font-mono text-sm">{app.regNo}</td>
                    <td className="font-medium">{app.student}</td>
                    <td className="font-bold text-primary">{app.company}</td>
                    <td>{app.role}</td>
                    <td>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${app.status === 'Shortlisted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-secondary text-xs py-1 px-3">Update Status</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Selected Students' && (
        <div className="animate-fade-in glass-card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-green-50 dark:bg-green-900/10">
            <h2 className="font-bold text-success flex items-center gap-2"><Award size={20}/> Hall of Fame</h2>
            <button className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Placement</button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Package (CTC)</th>
                  <th>Offer Date</th>
                </tr>
              </thead>
              <tbody>
                {selections.map(sel => (
                  <tr key={sel.selectionId}>
                    <td className="font-mono text-sm">{sel.regNo}</td>
                    <td className="font-medium">{sel.student}</td>
                    <td className="font-bold text-primary">{sel.company}</td>
                    <td>{sel.role}</td>
                    <td className="font-bold text-success">{sel.ctc}</td>
                    <td>{new Date(sel.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Placeholders */}
      {['Eligibility Tracker', 'Interviews'].includes(activeTab) && (
        <div className="animate-fade-in glass-card p-12 text-center">
          <Clock size={48} className="text-muted opacity-50 mx-auto mb-4"/>
          <h2 className="text-xl font-bold mb-2">{activeTab} Module</h2>
          <p className="text-muted">This module provides comprehensive management features for {activeTab.toLowerCase()}.</p>
        </div>
      )}

      {activeTab === 'Reports' && (
        <div className="animate-fade-in glass-card p-12 flex flex-col items-center text-center">
          <Download size={48} className="text-muted opacity-50 mb-4"/>
          <h2 className="text-xl font-bold mb-2">Placement Data Export</h2>
          <p className="text-muted max-w-md mb-6">Export NIRF placement data, company-wise selections, and department-wise statistics.</p>
          <div className="flex gap-4">
            <button className="btn-primary flex items-center gap-2"><Download size={16}/> NIRF Report</button>
            <button className="btn-secondary flex items-center gap-2"><Download size={16}/> Department Summary</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlacementManagement;
