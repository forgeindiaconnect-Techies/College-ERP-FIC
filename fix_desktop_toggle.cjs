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
    
    // Replace transform: translateX(-100%) !important; with margin-left: -280px !important;
    // but only inside @media (min-width: 769px) blocks.
    // Instead of complex regex, let's just find and replace the specific string:
    
    // Actually, on desktop, the sidebar should animate out. Let's just do a blanket replace if it's inside min-width: 769px
    const parts = content.split('@media (min-width: 769px)');
    if (parts.length > 1) {
      parts[1] = parts[1].replace(/transform:\\s*translateX\\(-100%\\)\\s*!important;/g, 'margin-left: -280px !important;');
      content = parts.join('@media (min-width: 769px)');
    }
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed desktop toggle in:', relPath);
  }
});

