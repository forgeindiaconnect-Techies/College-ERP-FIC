import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Users, Navigation, CheckCircle, Clock } from 'lucide-react';
import { getTransportDrivers, getTransportRoutes, getTransportStudents, getDriverAttendance } from '../../api/index';
import './DriverDashboard.css';

const DriverDashboard = () => {
  const [session, setSession] = useState({});
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    vehicle: null,
    route: null,
    students: [],
    attendance: null
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = JSON.parse(sessionStorage.getItem('driver_session') || '{}');
        setSession(data);
        
        const driverId = data.referenceId;
        if (!driverId) return;

        // 1. Fetch drivers to find my assignments
        const driversRes = await getTransportDrivers();
        const me = driversRes.data.find(d => d.driverId === driverId || (driverId === 'DRV001' && d.name.includes('Suresh')));
        if (!me) return;

        // Fetch concurrently
        const [routesRes, studentsRes, attendanceRes] = await Promise.all([
          getTransportRoutes().catch(() => ({ data: [] })),
          getTransportStudents().catch(() => ({ data: [] })),
          getDriverAttendance({ driverId }).catch(() => ({ data: [] }))
        ]);

        const myVehicle = { vehicleNumber: me.vehicleId, vehicleId: me.vehicleId };
        const myRoute = routesRes.data.find(r => r.name === me.routeId || r.routeId === me.routeId);
        const myStudents = studentsRes.data.filter(s => s.routeId === me.routeId);
        
        const todayStr = new Date().toISOString().split('T')[0];
        const myAttendance = attendanceRes.data.find(a => a.date === todayStr);

        setDashboardData({
          vehicle: myVehicle,
          route: myRoute,
          students: myStudents,
          attendance: myAttendance
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="driver-loading-container">
        <span className="driver-spinner-large"></span>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in" style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Premium Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        color: '#fff',
        boxShadow: '0 8px 20px -5px rgba(59, 130, 246, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative blur */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px 0' }}>
            Welcome back, {session.name || 'Driver'}!
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem', fontWeight: 500 }}>
            Here is an overview of your schedule, route, and assignments for today.
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.15)', padding: '0.4rem 1rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 700 }}>
          DRIVER ID: {session.referenceId || 'N/A'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="driver-metrics-grid">
        <div className="d-metric-card">
          <div className="metric-icon-d indigo"><Bus size={22} /></div>
          <div className="d-metric-details">
            <span className="card-title-d">Assigned Vehicle</span>
            <h2 className="metric-value-d">{dashboardData.vehicle?.vehicleNumber || 'Unassigned'}</h2>
            <div className="metric-sub-d text-success-d">
               {dashboardData.vehicle ? 'Vehicle is Ready' : 'Awaiting Assignment'}
            </div>
          </div>
        </div>

        <div className="d-metric-card">
          <div className="metric-icon-d blue"><MapPin size={22} /></div>
          <div className="d-metric-details">
            <span className="card-title-d">Assigned Route</span>
            <h2 className="metric-value-d">{dashboardData.route?.name || 'Unassigned'}</h2>
            <div className="metric-sub-d text-success-d">
               {dashboardData.route ? 'Route Active' : 'No Route Assigned'}
            </div>
          </div>
        </div>

        <div className="d-metric-card">
          <div className="metric-icon-d orange"><Users size={22} /></div>
          <div className="d-metric-details">
            <span className="card-title-d">Students Boarding</span>
            <h2 className="metric-value-d">{dashboardData.students.length} / {dashboardData.route?.capacity || '-'}</h2>
            <div className="metric-sub-d text-muted">Total Enrolled</div>
          </div>
        </div>

        <div className="d-metric-card">
          <div className="metric-icon-d green"><Clock size={22} /></div>
          <div className="d-metric-details">
            <span className="card-title-d">Attendance Status</span>
            <h2 className="metric-value-d">
               {dashboardData.attendance && dashboardData.attendance.checkInTime ? 'Checked In' : 'Not Checked In'}
            </h2>
            <div className={`metric-sub-d ${dashboardData.attendance && dashboardData.attendance.checkInTime ? 'text-success-d' : 'text-danger-d'}`}>
               {dashboardData.attendance && dashboardData.attendance.checkInTime ? `At ${dashboardData.attendance.checkInTime}` : 'Please mark attendance'}
            </div>
          </div>
        </div>
      </div>

      {/* Route Stops Board */}
      <div className="glass-card" style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Navigation size={20} style={{ color: '#3b82f6' }}/> Today's Route Stops
          </h3>
          <span style={{ background: '#3b82f6', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
            {dashboardData.route?.points?.length || 0} STOPS
          </span>
        </div>
        
        <div className="driver-list">
          {dashboardData.route?.points && dashboardData.route.points.length > 0 ? (
            dashboardData.route.points.map((stop, i) => {
              const studentsAtStop = dashboardData.students.filter(s => s.pickupPoint === stop).length;
              const isFirst = i === 0;
              const status = isFirst ? 'Next Stop' : 'Pending';
              
              return (
                <div key={i} className="hover-scale" style={{ borderLeft: `4px solid ${isFirst ? '#3b82f6' : '#94a3b8'}`, padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>{stop}</h4>
                    <span style={{ fontSize: '0.75rem', background: isFirst ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: isFirst ? '#3b82f6' : '#64748b', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                      {status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Scheduled: ~Morning</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> Boarding: <strong style={{ color: 'var(--text-main)' }}>{studentsAtStop} Students</strong></span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <Navigation size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>No route stops available or assigned for today.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DriverDashboard;
