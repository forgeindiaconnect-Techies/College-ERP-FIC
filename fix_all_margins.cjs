const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/student/components/StudentSidebar.css',
  'src/staff/components/StaffSidebar.css',
  'src/parent/components/ParentSidebar.css',
  'src/hod/components/HodSidebar.css',
  'src/driver/components/DriverSidebar.css',
  'src/accounts/components/AccountsSidebar.css',
  'src/subadmin/components/SubAdminSidebar.css',
  'src/principal/components/PrincipalSidebar.css',
  'src/components/layout/Sidebar.css'
];

cssFiles.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // First, fix the broken mobile margin
    // I know that the first media query is max-width: 768px, and the second is min-width: 769px.
    // I will replace margin-left: -280px !important; with transform: translateX(-100%); ONLY IF it's before min-width: 769px.
    const parts = content.split('@media (min-width: 769px)');
    
    if (parts[0]) {
      parts[0] = parts[0].replace(/margin-left:\s*-280px\s*!important;/g, 'transform: translateX(-100%);');
    }
    
    if (parts.length > 1) {
      // In the desktop part (parts[1]), we WANT margin-left: -280px !important;
      parts[1] = parts[1].replace(/transform:\s*translateX\(-100%\)\s*!important;/g, 'margin-left: -280px !important;');
    }
    
    content = parts.join('@media (min-width: 769px)');
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed:', relPath);
  }
});
