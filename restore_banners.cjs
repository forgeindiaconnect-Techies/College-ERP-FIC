const fs = require('fs');

// 1. Restore HodDashboard.jsx
const hodPath = 'src/hod/pages/HodDashboard.jsx';
if (fs.existsSync(hodPath)) {
  let content = fs.readFileSync(hodPath, 'utf8');
  content = content.replace(
    /<div className="hod-welcome-text" style=\{\{ color: '#fff' \}\}>\s*<h1 style=\{\{ fontSize: '1\.5rem', color: '#fff' \}\}>Welcome, \{deptCode\} HOD Dashboard<\/h1>\s*<p className="hod-welcome-sub" style=\{\{ color: '#fff' \}\}>Managing and scoping data for the <strong>\{deptName\}<\/strong> department\.<\/p>\s*<\/div>/,
    `<div className="hod-welcome-text">
          <h1>Department Dashboard Overview</h1>
          <p className="hod-welcome-sub">Managing and scoping data for the <strong>{deptName}</strong> department.</p>
        </div>`
  );
  fs.writeFileSync(hodPath, content, 'utf8');
  console.log('Restored HodDashboard.jsx');
}

// 2. Restore StaffDashboard.jsx
const staffPath = 'src/staff/pages/StaffDashboard.jsx';
if (fs.existsSync(staffPath)) {
  let content = fs.readFileSync(staffPath, 'utf8');
  content = content.replace(
    /<div className="staff-welcome-text" style=\{\{ color: '#fff' \}\}>\s*<h1 style=\{\{ fontSize: '1\.5rem', color: '#fff' \}\}>Welcome, \{staffName\?\.replace\('Dr\. ', ''\)\?\.replace\('Prof\. ', ''\) \|\| 'Faculty'\}<\/h1>\s*<p className="staff-welcome-sub" style=\{\{ color: '#fff' \}\}>Department of <strong>\{staffDept\}<\/strong> A Classroom Instructor<\/p>\s*<\/div>/,
    `<div className="staff-welcome-text">
          <h1>Faculty Dashboard Overview</h1>
          <p className="staff-welcome-sub">Department of <strong>{staffDept}</strong> • Classroom Instructor</p>
        </div>`
  );
  // Also fix mojibake in StaffDashboard
  content = content.replace(/A Classroom/g, '• Classroom');
  fs.writeFileSync(staffPath, content, 'utf8');
  console.log('Restored StaffDashboard.jsx');
}

// 3. Restore PrincipalDashboard.jsx
const princPath = 'src/principal/pages/PrincipalDashboard.jsx';
if (fs.existsSync(princPath)) {
  let content = fs.readFileSync(princPath, 'utf8');
  content = content.replace(
    /<div style=\{\{ position: 'relative', zIndex: 1 \}\}>\s*<h1 style=\{\{ fontSize: '1\.5rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' \}\}>\s*Institution Roster\s*<\/h1>\s*<p style=\{\{ margin: 0, opacity: 0\.9, fontSize: '0\.85rem', fontWeight: 500, color: '#fff' \}\}>\s*Welcome back, \{userName\}\. Monitor all registered HODs, Staff, and Students across departments\.\s*<\/p>\s*<\/div>/,
    `<div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Institution Roster
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem', fontWeight: 500 }}>
            Welcome back, {userName}. Monitor all registered HODs, Staff, and Students across departments.
          </p>
        </div>`
  );
  fs.writeFileSync(princPath, content, 'utf8');
  console.log('Restored PrincipalDashboard.jsx');
}
