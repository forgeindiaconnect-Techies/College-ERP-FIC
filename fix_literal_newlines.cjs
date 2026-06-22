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
    
    // Fix literal '\n' injected by PowerShell
    content = content.replace(/position: relative;\\n\s*flex-shrink: 0;/g, 'position: relative;\n  flex-shrink: 0;');
    
    // Also fix the mobile media query injection which also had '\n'
    content = content.replace(/\\n\s*position: fixed !important;/g, '\n    position: fixed !important;');
    content = content.replace(/\\n\s*left: 0 !important;/g, '\n    left: 0 !important;');
    content = content.replace(/\\n\s*top: 0 !important;/g, '\n    top: 0 !important;');
    content = content.replace(/\\n\s*height: 100vh !important;/g, '\n    height: 100vh !important;');
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed literal newlines in:', relPath);
  }
});
