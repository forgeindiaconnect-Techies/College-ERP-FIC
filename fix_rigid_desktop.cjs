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
    
    // Remove the desktop sidebar-open rule entirely
    const desktopRuleRegex = /@media\\s*\\(min-width:\\s*769px\\)\\s*\\{\\s*\\.([^\\s]+)\\.sidebar-open\\s*\\{\\s*margin-left:\\s*-280px\\s*!important;\\s*\\}\\s*\\}/g;
    
    content = content.replace(desktopRuleRegex, '');
    
    // Also remove any transform: translateX(-100%) !important; variants just in case
    const desktopRuleRegex2 = /@media\\s*\\(min-width:\\s*769px\\)\\s*\\{\\s*\\.([^\\s]+)\\.sidebar-open\\s*\\{\\s*transform:\\s*translateX\\(-100%\\)\\s*!important;\\s*\\}\\s*\\}/g;
    content = content.replace(desktopRuleRegex2, '');
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed rigid desktop sidebar in:', relPath);
  }
});

const layoutCssPath = path.join(__dirname, 'src/components/layout/Layout.css');
if (fs.existsSync(layoutCssPath)) {
  let layoutContent = fs.readFileSync(layoutCssPath, 'utf8');
  // Remove the main-wrapper expanding rule on desktop
  const layoutRegex = /@media\\s*\\(min-width:\\s*769px\\)\\s*\\{\\s*\\.main-wrapper\\.sidebar-open\\s*\\{\\s*margin-left:\\s*0\\s*!important;\\s*width:\\s*100%\\s*!important;\\s*\\}\\s*\\}/g;
  layoutContent = layoutContent.replace(layoutRegex, '');
  fs.writeFileSync(layoutCssPath, layoutContent);
  console.log('Fixed rigid desktop layout in Layout.css');
}

