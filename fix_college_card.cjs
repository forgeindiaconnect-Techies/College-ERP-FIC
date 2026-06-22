const fs = require('fs');
const filesToClean = [
  'src/student/pages/StudentDashboard.jsx',
  'src/parent/pages/ParentDashboard.jsx',
  'src/accounts/pages/AccountsDashboard.jsx',
  'src/hod/pages/HodDashboard.jsx',
  'src/staff/pages/StaffDashboard.jsx',
  'src/driver/pages/DriverDashboard.jsx'
];

for (const f of filesToClean) {
  const file = 'e:/Antigravity/New folder/' + f;
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove the import statement
    content = content.replace(/import CollegeInfoCard from ['"].*?['"];?[\r\n]*/g, '');
    
    // Remove the component usage
    content = content.replace(/[ \t]*<CollegeInfoCard \/>[\r\n]*/g, '');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Cleaned ' + f);
  }
}
