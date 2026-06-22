const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/student/components/StudentSidebar.css',
  'src/staff/components/StaffSidebar.css',
  'src/parent/components/ParentSidebar.css',
  'src/hod/components/HodSidebar.css',
  'src/components/layout/Sidebar.css',
  'src/driver/components/DriverSidebar.css',
  'src/accounts/components/AccountsSidebar.css'
];

cssFiles.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/\{ filter: brightness\(0\); \}/g, "{ content: url('/logo-dark.svg'); }");
    content = content.replace(/\{ filter: none; \}/g, "{ content: url('/logo.svg'); }");
    fs.writeFileSync(fullPath, content);
    console.log('Fixed', relPath);
  } else {
    console.log('Not found:', relPath);
  }
});
