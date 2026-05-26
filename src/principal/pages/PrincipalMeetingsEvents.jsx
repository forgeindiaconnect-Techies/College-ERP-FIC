import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Plus,
  Mail,
  FileText,
  CheckSquare,
  ClipboardList,
  AlertTriangle,
  Award,
  Image as ImageIcon,
  QrCode,
  Download,
  Share2,
  Trash2,
  Edit2,
  Search,
  Filter,
  CheckCircle,
  X,
  Send,
  Sparkles,
  Link as LinkIcon,
  BookOpen,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import '../../pages/Dashboard.css';

// Initial Events and Meetings seed data
const initialEvents = [
  {
    id: 1,
    name: 'Q3 Academic Review Meeting',
    type: 'HOD Meeting',
    department: 'All Departments',
    dateTime: '2026-05-27T10:00',
    organizer: 'Dr. R. K. Sharma (Principal)',
    venue: 'Conference Room A',
    status: 'Scheduled',
    agenda: 'Review final semester syllabus completion, lab equipment procurement, and placement status.',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    attendees: [
      { name: 'Dr. Amit Verma (CSE HOD)', attended: true },
      { name: 'Dr. Priya Nair (ECE HOD)', attended: true },
      { name: 'Dr. Sunil Rao (EEE HOD)', attended: false },
      { name: 'Dr. V. K. Malhotra (MECH HOD)', attended: true },
      { name: 'Prof. K. G. Menon (MBA Coordinator)', attended: true }
    ],
    notes: 'Approved the new syllabus updates. Lab budget approved up to ₹5 Lakhs per department.',
    documents: ['syllabus_review_draft.pdf', 'lab_budget_report.xlsx'],
    gallery: []
  },
  {
    id: 2,
    name: 'National Seminar on Quantum Computing',
    type: 'Seminars',
    department: 'CSE & ECE',
    dateTime: '2026-05-28T09:30',
    organizer: 'Dr. Amit Verma (CSE)',
    venue: 'Main Auditorium',
    status: 'Scheduled',
    agenda: 'Distinguished lectures on quantum computing paradigms, cryptography, and hands-on simulation tools.',
    meetingUrl: 'https://zoom.us/j/9876543210',
    attendees: [
      { name: 'Rohan Gupta (CSE Student)', attended: false },
      { name: 'Neha Reddy (ECE Student)', attended: false },
      { name: 'Pooja Hegde (CSE Student)', attended: false },
      { name: 'Shreya Iyer (CSE Student)', attended: false }
    ],
    notes: '',
    documents: ['quantum_seminar_brochure.pdf'],
    gallery: []
  },
  {
    id: 3,
    name: 'Google Cloud Campus Placement Drive',
    type: 'Placement Drives',
    department: 'CSE, ECE & BCA',
    dateTime: '2026-05-29T09:00',
    organizer: 'Prof. Sandeep Mehta (Placement Officer)',
    venue: 'Placement Cell & Seminar Hall 2',
    status: 'Scheduled',
    agenda: 'Pre-placement talk, coding rounds, and technical/HR interviews for Cloud Associate Engineer roles.',
    meetingUrl: 'https://meet.google.com/google-cloud-drive',
    attendees: [
      { name: 'Rohan Gupta (CSE Student)', attended: false },
      { name: 'Neha Reddy (ECE Student)', attended: false },
      { name: 'Pooja Hegde (CSE Student)', attended: false }
    ],
    notes: '',
    documents: ['google_placement_criteria.pdf'],
    gallery: []
  },
  {
    id: 4,
    name: 'Parent-Teacher Council Association Meet',
    type: 'Parent Meetings',
    department: 'All Departments',
    dateTime: '2026-05-26T14:30',
    organizer: 'Dr. R. K. Sharma (Principal)',
    venue: 'Open Amphitheatre',
    status: 'Ongoing',
    agenda: 'Discuss student discipline, exam outcomes, upcoming hostel renovation, and college transport routes.',
    meetingUrl: '',
    attendees: [
      { name: 'Mr. R. C. Gupta (Parent of Rohan)', attended: true },
      { name: 'Mrs. S. Reddy (Parent of Neha)', attended: true },
      { name: 'Mr. M. Hegde (Parent of Pooja)', attended: false }
    ],
    notes: 'Parents requested extra bus routes for the West campus line. Principal agreed to review with Transport In-charge.',
    documents: [],
    gallery: []
  },
  {
    id: 5,
    name: 'Advanced React & Node Workshop',
    type: 'Workshops',
    department: 'CSE & BCA',
    dateTime: '2026-05-25T10:00',
    organizer: 'Dr. Amit Verma (CSE)',
    venue: 'CSE Lab 4',
    status: 'Completed',
    agenda: 'Full stack development training, state management with Redux, database optimization, and deployment cycles.',
    meetingUrl: '',
    attendees: [
      { name: 'Rohan Gupta (CSE Student)', attended: true },
      { name: 'Pooja Hegde (CSE Student)', attended: true },
      { name: 'Shreya Iyer (CSE Student)', attended: true }
    ],
    notes: 'Workshop successfully completed by 80 engineering students. Performance reports generated.',
    documents: ['react_workshop_modules.pdf'],
    gallery: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800']
  },
  {
    id: 6,
    name: 'Proposed AI-ML Hackathon Approval',
    type: 'Academic Events',
    department: 'CSE',
    dateTime: '2026-06-02T10:00',
    organizer: 'Dr. Amit Verma (CSE)',
    venue: 'Seminar Hall 1',
    status: 'Pending Approval',
    agenda: 'Request approval for a 24-hour hackathon, cash prizes, food arrangements, and guest mentor invites.',
    meetingUrl: '',
    attendees: [],
    notes: '',
    documents: ['hackathon_budget_proposal.pdf'],
    gallery: []
  }
];

export default function PrincipalMeetingsEvents() {
  const [events, setEvents] = useState(initialEvents);
  
  // Tab and view controllers
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Modal controllers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showRestrictionDialog, setShowRestrictionDialog] = useState(false);
  const [restrictionAction, setRestrictionAction] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [activityLogs, setActivityLogs] = useState([
    { time: '17:05', msg: 'System logs loaded. Pushed recent departmental updates.' },
    { time: '16:30', msg: 'Principal synced calendar invitations for HOD Meeting.' },
    { time: '15:15', msg: 'Completed workshop report filed for React & Node Workshop.' }
  ]);

  // Form states for creating/editing meeting & event
  const [formData, setFormData] = useState({
    name: '',
    type: 'Staff Meetings',
    department: 'All Departments',
    dateTime: '',
    organizer: 'Dr. R. K. Sharma (Principal)',
    venue: '',
    status: 'Scheduled',
    agenda: '',
    isOnline: false,
    meetingUrl: '',
    attendeesListString: 'Dr. Amit Verma, Dr. Priya Nair, Dr. Sunil Rao, Dr. V. K. Malhotra',
    agendaFile: ''
  });

  // Certificate Generator template state
  const [certName, setCertName] = useState('Rohan Gupta');
  const [certSeminar, setCertSeminar] = useState('Advanced React & Node Workshop');

  // Trigger Toasts
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Activity logger helper
  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    setActivityLogs(prev => [{ time, msg }, ...prev]);
  };

  // Restrict access handler
  const handleRestrictedAction = (action) => {
    setRestrictionAction(action);
    setShowRestrictionDialog(true);
  };

  // Create event action
  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dateTime || !formData.venue) {
      triggerToast('⚠️ Please fill out all required fields.');
      return;
    }

    const attendeesParsed = formData.attendeesListString
      .split(',')
      .map(name => ({ name: name.trim(), attended: false }))
      .filter(item => item.name);

    const newEvent = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      department: formData.department,
      dateTime: formData.dateTime,
      organizer: formData.organizer,
      venue: formData.venue,
      status: formData.status,
      agenda: formData.agenda,
      meetingUrl: formData.isOnline ? (formData.meetingUrl || 'https://meet.google.com/' + Math.random().toString(36).substring(2, 7)) : '',
      attendees: attendeesParsed,
      notes: '',
      documents: formData.agendaFile ? [formData.agendaFile] : [],
      gallery: []
    };

    setEvents(prev => [newEvent, ...prev]);
    setShowCreateModal(false);
    addLog(`Principal scheduled a new ${formData.type}: "${formData.name}"`);
    triggerToast(`🎉 Successfully scheduled "${formData.name}" and sent invites!`);
    
    // Reset form
    setFormData({
      name: '',
      type: 'Staff Meetings',
      department: 'All Departments',
      dateTime: '',
      organizer: 'Dr. R. K. Sharma (Principal)',
      venue: '',
      status: 'Scheduled',
      agenda: '',
      isOnline: false,
      meetingUrl: '',
      attendeesListString: 'Dr. Amit Verma, Dr. Priya Nair, Dr. Sunil Rao, Dr. V. K. Malhotra',
      agendaFile: ''
    });
  };

  // Status changer / Actions
  const handleApproveEvent = (id) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'Scheduled' } : ev));
    const ev = events.find(e => e.id === id);
    addLog(`Principal approved proposed event: "${ev.name}"`);
    triggerToast(`✅ Event "${ev.name}" approved successfully!`);
  };

  const handleCancelEvent = (id) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'Cancelled' } : ev));
    const ev = events.find(e => e.id === id);
    addLog(`Principal cancelled event: "${ev.name}"`);
    triggerToast(`❌ Event "${ev.name}" has been marked as Cancelled.`);
  };

  const handleSendReminder = (evName) => {
    addLog(`Emailed automated invitations & reminders for "${evName}" to attendees.`);
    triggerToast(`✉️ Reminders dispatched successfully to participants!`);
  };

  // Notes update simulator
  const [newNoteText, setNewNoteText] = useState('');
  const handleAddNote = (eventId) => {
    if (!newNoteText.trim()) return;
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        return { ...ev, notes: ev.notes ? ev.notes + '\n• ' + newNoteText : '• ' + newNoteText };
      }
      return ev;
    }));
    const ev = events.find(e => e.id === eventId);
    addLog(`Updated meeting notes for "${ev.name}"`);
    setNewNoteText('');
    triggerToast('📝 Notes updated successfully.');
  };

  // Document upload simulator
  const handleDocUploadSim = (eventId) => {
    const docName = `agenda_appendix_${Math.floor(Math.random() * 1000)}.pdf`;
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        return { ...ev, documents: [...ev.documents, docName] };
      }
      return ev;
    }));
    triggerToast(`📎 Document "${docName}" attached successfully!`);
  };

  // Gallery simulation
  const handleGallerySim = (eventId) => {
    const urls = [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'
    ];
    const pickedUrl = urls[Math.floor(Math.random() * urls.length)];
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        return { ...ev, gallery: [...ev.gallery, pickedUrl] };
      }
      return ev;
    }));
    triggerToast('🖼️ New event snapshot added to gallery!');
  };

  // Filtered Events
  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.venue.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedTab === 'All') return matchesSearch;
    if (selectedTab === 'Meetings') return matchesSearch && (ev.type.includes('Meeting') || ev.type.includes('PTA'));
    if (selectedTab === 'Seminars & Workshops') return matchesSearch && (ev.type === 'Seminars' || ev.type === 'Workshops');
    if (selectedTab === 'Academic & Placement') return matchesSearch && (ev.type.includes('Placement') || ev.type.includes('Academic'));
    if (selectedTab === 'Pending Approvals') return matchesSearch && ev.status === 'Pending Approval';
    return matchesSearch;
  });

  // Derived metrics for dashboard cards
  const upcomingMeetingsCount = events.filter(e => (e.type.includes('Meeting') || e.type.includes('PTA')) && e.status === 'Scheduled').length;
  const todayEventsCount = events.filter(e => e.dateTime.startsWith('2026-05-26')).length;
  const pendingApprovalsCount = events.filter(e => e.status === 'Pending Approval').length;
  const scheduledSeminarsCount = events.filter(e => e.type === 'Seminars' && e.status === 'Scheduled').length;
  const departmentEventsCount = events.filter(e => e.department !== 'All Departments').length;

  return (
    <div className="main-content" style={{ padding: '2rem', minHeight: 'calc(100vh - 70px)', background: 'var(--bg-primary)' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          padding: '1rem 1.5rem',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderLeft: '4px solid var(--success)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <Sparkles size={18} className="text-[#10b981]" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar className="text-[#4f46e5]" size={28} /> Meetings & Event Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Schedule administrative forums, authorize departmental academic initiatives, compile attendee metrics, and sync schedules.
          </p>
        </div>

        {/* Oversight Access Control Indicator */}
        <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px', borderLeft: '3px solid var(--primary)' }}>
          <UserCheck size={18} className="text-[#4f46e5]" />
          <div>
            <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Oversight Bounds</span>
            <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Principal Account - Scheduler Role</strong>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD CARDS (5 Cards) --- */}
      <div className="stats-grid mb-6 animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        <div className="stat-card" style={{ borderBottom: '3px solid var(--primary)' }}>
          <div className="stat-icon-wrapper text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #3b82f6)' }}><Clock size={18} /></div>
          <div className="stat-details">
            <h3>Upcoming Meetings</h3>
            <p className="stat-value">{upcomingMeetingsCount}</p>
            <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Staff & HOD Syncs</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderBottom: '3px solid var(--success)' }}>
          <div className="stat-icon-wrapper text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Calendar size={18} /></div>
          <div className="stat-details">
            <h3>Today Events</h3>
            <p className="stat-value">{todayEventsCount}</p>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active schedules</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderBottom: '3px solid var(--warning)' }}>
          <div className="stat-icon-wrapper text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><AlertTriangle size={18} /></div>
          <div className="stat-details">
            <h3>Pending Approvals</h3>
            <p className="stat-value">{pendingApprovalsCount}</p>
            <span style={{ fontSize: '0.7rem', color: 'var(--warning)' }}>HOD proposals</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderBottom: '3px solid var(--secondary)' }}>
          <div className="stat-icon-wrapper text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}><BookOpen size={18} /></div>
          <div className="stat-details">
            <h3>Scheduled Seminars</h3>
            <p className="stat-value">{scheduledSeminarsCount}</p>
            <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Invites dispatched</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderBottom: '3px solid #8b5cf6' }}>
          <div className="stat-icon-wrapper text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><Users size={18} /></div>
          <div className="stat-details">
            <h3>Department Events</h3>
            <p className="stat-value">{departmentEventsCount}</p>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cross-dept initiatives</span>
          </div>
        </div>

      </div>

      {/* INTERACTIVE CONTROLS BAR */}
      <div className="glass-card mb-6" style={{ padding: '1.2rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {['All', 'Meetings', 'Seminars & Workshops', 'Academic & Placement', 'Pending Approvals'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: selectedTab === tab ? 'var(--primary)' : 'transparent',
                  color: selectedTab === tab ? 'white' : 'var(--text-muted)',
                  border: selectedTab === tab ? 'none' : '1px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 items-center flex-wrap">
            
            {/* Search */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <input
                type="text"
                placeholder="Search events, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.5rem 1rem 0.5rem 2.2rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  width: '200px'
                }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            {/* Create Meeting/Event Trigger */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', borderRadius: '8px' }}
            >
              <Plus size={16} /> Create Schedule
            </button>
            
          </div>

        </div>
      </div>

      {/* MAIN LAYOUT SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: EVENTS TABLE */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', minHeight: '500px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClipboardList size={18} className="text-[#4f46e5]" /> Scheduled Operations & Forums
          </h2>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Event Details</th>
                  <th>Department</th>
                  <th>Date & Time</th>
                  <th>Organizer / Host</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No meetings or events found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map(event => (
                    <tr key={event.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedEvent(event)}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{event.name}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', fontWeight: 600 }}>
                          📂 {event.type}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          backgroundColor: 'rgba(79, 70, 229, 0.08)', 
                          color: 'var(--primary)', 
                          padding: '3px 8px', 
                          borderRadius: '6px', 
                          fontSize: '0.72rem',
                          fontWeight: 700 
                        }}>
                          {event.department}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        <div>{new Date(event.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          ⏰ {new Date(event.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {event.organizer}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} className="text-[#3b82f6]" /> {event.venue}
                        </div>
                        {event.meetingUrl && (
                          <a 
                            href={event.meetingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ fontSize: '0.7rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Video size={11} /> Launch Virtual Link
                          </a>
                        )}
                      </td>
                      <td>
                        <span style={{ 
                          backgroundColor: 
                            event.status === 'Scheduled' ? 'rgba(59, 130, 246, 0.1)' :
                            event.status === 'Ongoing' ? 'rgba(16, 185, 129, 0.1)' :
                            event.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' :
                            event.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' :
                            'rgba(245, 158, 11, 0.1)',
                          color: 
                            event.status === 'Scheduled' ? '#3b82f6' :
                            event.status === 'Ongoing' ? '#10b981' :
                            event.status === 'Completed' ? '#10b981' :
                            event.status === 'Cancelled' ? '#ef4444' :
                            '#f59e0b',
                          padding: '3px 8px', 
                          borderRadius: '6px', 
                          fontSize: '0.72rem', 
                          fontWeight: 700 
                        }}>
                          {event.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {event.status === 'Pending Approval' ? (
                            <button
                              onClick={() => handleApproveEvent(event.id)}
                              style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--success)', color: 'white', fontSize: '0.72rem', fontWeight: 600 }}
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendReminder(event.name)}
                              style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--primary)', color: 'white', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}
                            >
                              <Mail size={11} /> Remind
                            </button>
                          )}
                          
                          {event.status !== 'Cancelled' && event.status !== 'Completed' && (
                            <button
                              onClick={() => handleCancelEvent(event.id)}
                              style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--danger)', color: 'white', fontSize: '0.72rem', fontWeight: 600 }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL PANEL / UTILITIES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Detail Preview Panel */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', minHeight: '280px' }}>
            {selectedEvent ? (
              <div className="animate-fade-in">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {selectedEvent.type.toUpperCase()}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                      {selectedEvent.name}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                    <X size={18} />
                  </button>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  <strong>Agenda:</strong> {selectedEvent.agenda || 'No specific agenda description uploaded yet.'}
                </p>

                {/* Simulated Attendance Roster */}
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Track Attendance Roster</span>
                    <button 
                      onClick={() => setShowQrModal(true)}
                      style={{ background: 'transparent', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 600 }}
                    >
                      <QrCode size={12} /> QR Scanner
                    </button>
                  </div>
                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {selectedEvent.attendees.map((attendee, index) => (
                        <div key={index} className="flex justify-between items-center" style={{ fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{attendee.name}</span>
                          <span style={{ 
                            color: attendee.attended ? 'var(--success)' : 'var(--danger)', 
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            {attendee.attended ? '✓ Attended' : '✗ Absent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No attendees assigned to track yet.</span>
                  )}
                </div>

                {/* Meeting Notes Panel */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Notes & Action Items
                  </label>
                  {selectedEvent.notes ? (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--text-muted)', 
                      whiteSpace: 'pre-wrap', 
                      backgroundColor: 'rgba(245, 158, 11, 0.05)', 
                      padding: '0.6rem', 
                      borderRadius: '8px', 
                      borderLeft: '3px solid var(--warning)',
                      marginBottom: '0.5rem'
                    }}>
                      {selectedEvent.notes}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No meeting notes documented yet.</p>
                  )}
                  
                  <div className="flex gap-1">
                    <input 
                      type="text" 
                      placeholder="Add note item..." 
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                    />
                    <button 
                      onClick={() => handleAddNote(selectedEvent.id)}
                      style={{ background: 'var(--primary)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Attached Agendas & Slides
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.5rem' }}>
                    {selectedEvent.documents && selectedEvent.documents.map((doc, idx) => (
                      <div key={idx} className="flex justify-between items-center" style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-primary)', fontSize: '0.7rem' }}>
                        <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={11} className="text-[#3b82f6]" /> {doc}
                        </span>
                        <a href="#download" onClick={(e) => { e.preventDefault(); triggerToast(`📥 Downloading "${doc}"...`); }} style={{ color: 'var(--primary)' }}><Download size={11} /></a>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleDocUploadSim(selectedEvent.id)}
                    style={{ background: 'transparent', border: '1px dashed var(--border-color)', width: '100%', padding: '0.4rem', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    📎 Upload Document Agenda
                  </button>
                </div>

                {/* Event Gallery */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Event Gallery Snapshot Upload
                  </label>
                  {selectedEvent.gallery && selectedEvent.gallery.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '0.5rem' }}>
                      {selectedEvent.gallery.map((imgUrl, idx) => (
                        <img 
                          key={idx} 
                          src={imgUrl} 
                          alt="Event Snapshot" 
                          style={{ width: '100%', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No pictures uploaded yet.</p>
                  )}
                  <button 
                    onClick={() => handleGallerySim(selectedEvent.id)}
                    style={{ background: 'transparent', border: '1px dashed var(--border-color)', width: '100%', padding: '0.4rem', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                  >
                    <ImageIcon size={11} /> Upload Snapshot
                  </button>
                </div>

                {/* Integration triggers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <button 
                    onClick={() => triggerToast('📅 Calendar Synced! Calendar invites sent to Outlook/Google Calendar queues.')}
                    style={{ padding: '0.5rem', background: '#3b82f6', color: 'white', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                  >
                    <Calendar size={12} /> Sync Calendar
                  </button>
                  <button 
                    onClick={() => {
                      setCertSeminar(selectedEvent.name);
                      setShowCertificateModal(true);
                    }}
                    style={{ padding: '0.5rem', background: '#10b981', color: 'white', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                  >
                    <Award size={12} /> Generate Certificate
                  </button>
                </div>

              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)', textAlign: 'center' }}>
                <Calendar size={32} style={{ opacity: 0.5, marginBottom: '10px' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>No Event Selected</h4>
                <p style={{ fontSize: '0.75rem', maxWidth: '180px', margin: '4px auto 0' }}>Select any scheduled row to track attendance, notes, files, or print certificates.</p>
              </div>
            )}
          </div>

          {/* Activity Log / Notification Flow Feed */}
          <div className="glass-card" style={{ padding: '1.2rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⚡ Notification Flow & Activity Logs
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {activityLogs.map((log, idx) => (
                <div key={idx} style={{ fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: '6px' }}>[{log.time}]</span>
                  <span style={{ color: 'var(--text-muted)' }}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* IT SUPERADMIN BOUNDARY SAFEGUARDS */}
          <div className="glass-card" style={{ padding: '1.2rem', borderRadius: '16px', borderLeft: '3px solid var(--danger)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🛡️ Role Clearance Restrictions
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.8rem' }}>
              Principal boundaries prohibit structural database mutations:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button 
                onClick={() => handleRestrictedAction('Manage server databases / networks')}
                className="glass-card" 
                style={{ padding: '5px', fontSize: '0.72rem', borderRadius: '6px', textAlign: 'left', color: 'var(--danger)', fontWeight: 600 }}
              >
                ❌ Manage Server/Database
              </button>
              <button 
                onClick={() => handleRestrictedAction('Change core admin configurations')}
                className="glass-card" 
                style={{ padding: '5px', fontSize: '0.72rem', borderRadius: '6px', textAlign: 'left', color: 'var(--danger)', fontWeight: 600 }}
              >
                🔑 Alter Super Admin Settings
              </button>
              <button 
                onClick={() => handleRestrictedAction('Delete registered college users')}
                className="glass-card" 
                style={{ padding: '5px', fontSize: '0.72rem', borderRadius: '6px', textAlign: 'left', color: 'var(--danger)', fontWeight: 600 }}
              >
                🗑️ Delete System Users
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL 1: CREATE MEETING & EVENT SCHEDULER */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-secondary)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus className="text-[#4f46e5]" size={20} /> Create New Meeting & Event Schedule
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Event / Meeting Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Q3 Syllabus HOD Forum" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Category Type
                  </label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  >
                    <option value="Staff Meetings">Staff Meetings</option>
                    <option value="HOD Meetings">HOD Meetings</option>
                    <option value="Parent Meetings">Parent Meetings</option>
                    <option value="College Events">College Events</option>
                    <option value="Seminars">Seminars</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Placement Drives">Placement Drives</option>
                    <option value="Academic Events">Academic Events</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Assign Target Departments
                  </label>
                  <select 
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="CSE Department">CSE Department</option>
                    <option value="ECE Department">ECE Department</option>
                    <option value="EEE Department">EEE Department</option>
                    <option value="MECH Department">MECH Department</option>
                    <option value="MBA Department">MBA Department</option>
                    <option value="BCA Department">BCA Department</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Date & Scheduled Time *
                  </label>
                  <input 
                    type="datetime-local" 
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateTime: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Venue Location *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Conference Hall B" 
                    value={formData.venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Agenda Details
                </label>
                <textarea 
                  rows="3"
                  placeholder="Outline the detailed schedule objectives..."
                  value={formData.agenda}
                  onChange={(e) => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                ></textarea>
              </div>

              {/* Advanced Integrated Meeting Options */}
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.8rem', borderRadius: '8px' }}>
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="checkbox" 
                    id="isOnline"
                    checked={formData.isOnline}
                    onChange={(e) => setFormData(prev => ({ ...prev, isOnline: e.target.checked }))}
                  />
                  <label htmlFor="isOnline" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Enable Google Meet / Zoom Virtual Link Integration
                  </label>
                </div>
                {formData.isOnline && (
                  <input 
                    type="text" 
                    placeholder="Optional: Paste URL (or blank to auto-generate link)" 
                    value={formData.meetingUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingUrl: e.target.value }))}
                    style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Invite Attendees (comma-separated names)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Amit Verma, Prof. Sandeep, Rohan Gupta" 
                  value={formData.attendeesListString}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendeesListString: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Agenda Document / Brochure File name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. quantum_computing_flyer.pdf" 
                  value={formData.agendaFile}
                  onChange={(e) => setFormData(prev => ({ ...prev, agendaFile: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}
                >
                  Create & Send Invites
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QR CHECK-IN ATTENDANCE SIMULATOR */}
      {showQrModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', textAlign: 'center', background: 'var(--bg-secondary)' }}>
            <div className="flex justify-end">
              <button onClick={() => setShowQrModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <QrCode size={120} className="text-[#4f46e5]" style={{ margin: '0.5rem auto 1.5rem' }} />
            
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              QR Code Event Check-in Scanner
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Point student or faculty devices to this code to register immediate attendance.
            </p>

            <button 
              onClick={() => {
                if (selectedEvent) {
                  setEvents(prev => prev.map(ev => {
                    if (ev.id === selectedEvent.id) {
                      return {
                        ...ev,
                        attendees: ev.attendees.map(att => ({ ...att, attended: true }))
                      };
                    }
                    return ev;
                  }));
                  setSelectedEvent(prev => ({
                    ...prev,
                    attendees: prev.attendees.map(att => ({ ...att, attended: true }))
                  }));
                  triggerToast('✅ Registered all attendees via simulated QR check-in!');
                }
                setShowQrModal(false);
              }} 
              className="btn-primary w-full"
              style={{ padding: '0.6rem', borderRadius: '8px', justifyContent: 'center' }}
            >
              Simulate Scan Check-in
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: CERTIFICATE GENERATOR */}
      {showCertificateModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '640px', background: 'var(--bg-secondary)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award className="text-[#10b981]" size={20} /> Certificate Generator
              </h3>
              <button onClick={() => setShowCertificateModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Participant Full Name
                </label>
                <input 
                  type="text" 
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Seminar / Workshop title
                </label>
                <input 
                  type="text" 
                  value={certSeminar}
                  onChange={(e) => setCertSeminar(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Certificate Template */}
            <div style={{
              border: '8px double var(--primary)',
              padding: '2.5rem',
              textAlign: 'center',
              backgroundColor: '#fffaf0',
              color: '#2d3748',
              borderRadius: '8px',
              fontFamily: 'serif',
              position: 'relative',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
            }}>
              <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '0.8rem' }}>
                Certificate of Attendance
              </span>
              <p style={{ fontSize: '0.95rem', fontStyle: 'italic', margin: '0.5rem 0' }}>This is proudly presented to</p>
              <h2 style={{ fontSize: '2rem', color: '#1a202c', margin: '1rem 0', textDecoration: 'underline' }}>{certName}</h2>
              <p style={{ fontSize: '0.95rem', fontStyle: 'italic', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: '1.4' }}>
                for active participation and completion of the institutional seminar program:
              </p>
              <strong style={{ fontSize: '1.25rem', color: 'var(--primary)', display: 'block', marginBottom: '2rem' }}>
                "{certSeminar}"
              </strong>

              <div className="flex justify-between items-center" style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontStyle: 'normal', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ fontFamily: 'cursive', fontSize: '1rem', color: '#4a5568' }}>Dr. Amit Verma</div>
                  <strong style={{ display: 'block', marginTop: '2px' }}>Event Convener</strong>
                </div>
                <div>
                  <div style={{ fontFamily: 'cursive', fontSize: '1rem', color: '#4a5568' }}>Dr. R. K. Sharma</div>
                  <strong style={{ display: 'block', marginTop: '2px' }}>Principal Signatory</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => {
                  triggerToast('📥 Downloading high-res certificate PDF...');
                  setShowCertificateModal(false);
                }}
                className="btn-primary"
                style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#10b981' }}
              >
                <Download size={14} /> Download Certificate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: IT ACCESS BLOCKER DETAILS */}
      {showRestrictionDialog && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2rem', borderRadius: '16px', maxWidth: '460px', textAlign: 'center', background: 'var(--bg-secondary)', border: '1.5px solid var(--danger)' }}>
            <ShieldAlert size={48} className="text-[#ef4444]" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Clearance Violation (Access Blocked)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              You attempted to: <strong style={{ color: 'var(--text-main)' }}>{restrictionAction}</strong>.<br />
              Principal oversight is bounded to academic, curriculum, and departmental schedules. Structural database configurations require Super Admin authorization.
            </p>

            <button 
              onClick={() => setShowRestrictionDialog(false)} 
              className="btn-primary"
              style={{ background: 'var(--danger)', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Acknowledge Boundaries
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
