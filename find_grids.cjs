const fs = require('fs');
const files = [
  'e:/Antigravity/New folder/src/staff/pages/StaffDashboard.jsx',
  'e:/Antigravity/New folder/src/hod/pages/HodDashboard.jsx',
  'e:/Antigravity/New folder/src/accounts/pages/AccountsDashboard.jsx',
  'e:/Antigravity/New folder/src/superadmin/pages/SuperAdminDashboard.jsx',
  'e:/Antigravity/New folder/src/subadmin/pages/SubAdminDashboard.jsx',
  'e:/Antigravity/New folder/src/parent/pages/ParentDashboard.jsx',
  'e:/Antigravity/New folder/src/driver/pages/DriverDashboard.jsx',
  'e:/Antigravity/New folder/src/pages/departments/DepartmentDashboard.jsx',
  'e:/Antigravity/New folder/src/principal/pages/PrincipalDashboard.jsx',
  'e:/Antigravity/New folder/src/student/pages/StudentDashboard.jsx',
  'e:/Antigravity/New folder/src/pages/Dashboard.jsx'
];
files.forEach(f => {
  if(!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  let match;
  const regex = /<div className=\"([^\"]*grid[^\"]*)\"/g;
  while ((match = regex.exec(content)) !== null) {
    console.log(f.split('/').pop() + ': ' + match[1]);
  }
});
