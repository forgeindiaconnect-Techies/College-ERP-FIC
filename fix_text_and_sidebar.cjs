const fs = require('fs');

// 1. HodDashboard.jsx
const hodPath = 'src/hod/pages/HodDashboard.jsx';
let hodContent = fs.readFileSync(hodPath, 'utf8');
hodContent = hodContent.replace(
  /<div className="hod-welcome-text">[\s\S]*?<\/div>/,
  `<div className="hod-welcome-text" style={{ color: '#fff' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#fff' }}>Welcome, {deptCode} HOD Dashboard</h1>
          <p className="hod-welcome-sub" style={{ color: '#fff' }}>Managing and scoping data for the <strong>{deptName}</strong> department.</p>
        </div>`
);
fs.writeFileSync(hodPath, hodContent, 'utf8');

// 2. StaffDashboard.jsx
const staffPath = 'src/staff/pages/StaffDashboard.jsx';
let staffContent = fs.readFileSync(staffPath, 'utf8');
staffContent = staffContent.replace(
  /<div className="staff-welcome-text">[\s\S]*?<\/div>/,
  `<div className="staff-welcome-text" style={{ color: '#fff' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#fff' }}>Welcome, {staffName?.replace('Dr. ', '')?.replace('Prof. ', '') || 'Faculty'}</h1>
          <p className="staff-welcome-sub" style={{ color: '#fff' }}>Department of <strong>{staffDept}</strong> · Classroom Instructor</p>
        </div>`
);
fs.writeFileSync(staffPath, staffContent, 'utf8');

// 3. PrincipalDashboard.jsx
const princPath = 'src/principal/pages/PrincipalDashboard.jsx';
let princContent = fs.readFileSync(princPath, 'utf8');
princContent = princContent.replace(
  /<div style=\{\{ position: 'relative', zIndex: 1 \}\}>\s*<h1 style=\{\{ fontSize: '1\.5rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' \}\}>\s*Institution Roster\s*<\/h1>\s*<p style=\{\{ margin: 0, opacity: 0\.9, fontSize: '0\.85rem', fontWeight: 500 \}\}>\s*Welcome back, \{userName\}\. Monitor all registered HODs, Staff, and Students across departments\.\s*<\/p>\s*<\/div>/,
  `<div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            Institution Roster
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem', fontWeight: 500, color: '#fff' }}>
            Welcome back, {userName}. Monitor all registered HODs, Staff, and Students across departments.
          </p>
        </div>`
);
fs.writeFileSync(princPath, princContent, 'utf8');

// 4. Sidebar.css
const sidebarCssPath = 'src/components/layout/Sidebar.css';
let sidebarCssContent = fs.readFileSync(sidebarCssPath, 'utf8');
sidebarCssContent = sidebarCssContent.replace(
  /\.sidebar-close-btn \{[\s\S]*?\}/,
  `.sidebar-close-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--sidebar-border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  z-index: 1000;
  pointer-events: auto;
}`
);
fs.writeFileSync(sidebarCssPath, sidebarCssContent, 'utf8');

console.log('Fixed banners and sidebar CSS');
