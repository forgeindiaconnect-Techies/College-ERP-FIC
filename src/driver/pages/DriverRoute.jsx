import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Users, ArrowRight, AlertTriangle, Route as RouteIcon, Target, Activity } from 'lucide-react';
import { getTransportRoutes, getTransportStudents, getTransportDrivers } from '../../api/index';

const DriverRoute = () => {
  const [session, setSession] = useState({});
  const [driverInfo, setDriverInfo] = useState(null);
  const [route, setRoute] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        const data = JSON.parse(sessionStorage.getItem('driver_session') || '{}');
        setSession(data);
        
        const driversRes = await getTransportDrivers();
        const me = driversRes.data.find(d => d.driverId === data.referenceId || (data.referenceId === 'DRV001' && d.name.includes('Suresh')));
        setDriverInfo(me);

        if (me && me.routeId) {
          const routesRes = await getTransportRoutes();
          const myRoute = routesRes.data.find(r => r.name === me.routeId || r.routeId === me.routeId);
          setRoute(myRoute);

          const studentsRes = await getTransportStudents();
          const myStudents = studentsRes.data.filter(s => s.routeId === me.routeId);
          setStudents(myStudents);
        }
      } catch (err) {
        console.error('Failed to load route data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRouteData();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#6b7280' }}>
      <div style={{ width: '3rem', height: '3rem', border: '4px solid #f3e8ff', borderTopColor: '#9333ea', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
      <p style={{ fontWeight: 'bold' }}>Loading route details...</p>
    </div>
  );

  if (!route) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MapPin style={{ color: '#9333ea' }} /> My Route
        </h1>
        <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle size={24} />
          <p style={{ fontWeight: 500, margin: 0 }}>You have not been assigned a route yet. Please contact the Transport Admin.</p>
        </div>
      </div>
    );
  }

  const getStudentCountForStop = (stopName) => {
    return students.filter(s => s.pickupPoint === stopName).length;
  };

  const startingPoint = route.points && route.points.length > 0 ? route.points[0] : 'N/A';
  const destination = route.points && route.points.length > 1 ? route.points[route.points.length - 1] : 'N/A';

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin style={{ color: '#9333ea' }} /> My Route Schedule
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>View your daily pickup and drop schedule.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1.125rem' }}>
          <RouteIcon size={20} /> {route.name}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ flex: '1 1 200px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderLeft: '4px solid #a855f7', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Route ID</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{route.routeId}</p>
        </div>
        <div style={{ flex: '1 1 200px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderLeft: '4px solid #3b82f6', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Stops</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{route.points ? route.points.length : 0} Stops</p>
        </div>
        <div style={{ flex: '1 1 200px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderLeft: '4px solid #f97316', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Students</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{students.length}</p>
            <span style={{ color: '#6b7280', fontWeight: 'bold' }}>/ {route.capacity}</span>
          </div>
        </div>
        <div style={{ flex: '1 1 200px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderLeft: '4px solid #22c55e', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Est. Travel Time</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: '#22c55e' }} />
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>~45 mins</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        
        {/* Route Stops Timeline */}
        <div style={{ flex: '1 1 600px' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 2rem 0' }}>
              <Navigation style={{ color: '#9333ea' }} /> Stops & Pickups
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {route.points && route.points.map((stop, index) => {
                const count = getStudentCountForStop(stop);
                const isFirst = index === 0;
                const isLast = index === route.points.length - 1;
                
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'stretch', gap: '1.5rem' }}>
                    {/* Left Column: Line and Dot */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '2.5rem', flexShrink: 0 }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: isFirst ? '4px solid #dcfce7' : isLast ? '4px solid #fee2e2' : '4px solid #f3e8ff', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 10 }}>
                        {isFirst ? <Target size={16} style={{ color: '#22c55e' }}/> : isLast ? <MapPin size={16} style={{ color: '#dc2626' }}/> : <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#9333ea' }}></div>}
                      </div>
                      {!isLast && (
                        <div style={{ width: '2px', flex: 1, backgroundColor: '#e5e7eb', margin: '0.25rem 0' }}></div>
                      )}
                    </div>
                    
                    {/* Right Column: Stop Details */}
                    <div style={{ flex: 1, paddingBottom: isLast ? '0' : '2rem' }}>
                      <div style={{ backgroundColor: isFirst ? '#f8fafc' : isLast ? '#fdf2f8' : '#faf5ff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid', borderColor: isFirst ? '#e2e8f0' : isLast ? '#fce7f3' : '#f3e8ff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{stop}</h3>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: isFirst ? '#dcfce7' : isLast ? '#fee2e2' : 'white', color: isFirst ? '#166534' : isLast ? '#991b1b' : '#6b7280', border: !isFirst && !isLast ? '1px solid #e5e7eb' : 'none' }}>
                            {isFirst ? 'Start Point' : isLast ? 'Destination' : `Stop ${index}`}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                              <Users size={12} style={{ color: '#2563eb' }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}>
                            <strong style={{ color: '#111827' }}>{count}</strong> Students Boarding here
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DriverRoute;
