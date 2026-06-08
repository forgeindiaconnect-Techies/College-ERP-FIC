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
    <div className="driver-dashboard animate-fade-in">
      {/* Welcome Banner */}
      <div className="driver-welcome-banner">
        <div className="driver-banner-left">
          <h1>Welcome back, {session.name || 'Driver'}!</h1>
          <p>Here is an overview of your schedule, route, and assignments for today.</p>
        </div>
        <div className="driver-badge-number">
          <span>DRIVER ID: <strong>{session.referenceId || 'N/A'}</strong></span>
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
      <div className="driver-card" style={{ marginTop: '0.5rem' }}>
        <div className="driver-card-header">
          <h3><Navigation size={18} className="text-primary-d" style={{ marginRight: '8px' }}/> Today's Route Stops</h3>
          <span className="notif-pill-d">{dashboardData.route?.points?.length || 0} STOPS</span>
        </div>
        
        <div className="driver-list">
          {dashboardData.route?.points && dashboardData.route.points.length > 0 ? (
            dashboardData.route.points.map((stop, i) => {
              const studentsAtStop = dashboardData.students.filter(s => s.pickupPoint === stop).length;
              const isFirst = i === 0;
              const status = isFirst ? 'Next Stop' : 'Pending';
              
              return (
                <div key={i} className="driver-list-item" style={{ borderLeft: `4px solid ${isFirst ? '#3b82f6' : '#94a3b8'}`, padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 className="ann-title" style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0 }}>{stop}</h4>
                    <span style={{ fontSize: '0.75rem', background: isFirst ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: isFirst ? '#3b82f6' : '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      {status}
                    </span>
                  </div>
                  <div className="ann-desc" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Scheduled: ~Morning</span>
                    <span>Boarding: <strong>{studentsAtStop} Students</strong></span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted text-center" style={{ padding: '2rem' }}>No route stops available or assigned.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default DriverDashboard;
