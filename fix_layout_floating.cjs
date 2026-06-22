const fs = require('fs');
const path = require('path');

// 1. Fix Layout.css
const layoutCssPath = path.join(__dirname, 'src/components/layout/Layout.css');
if (fs.existsSync(layoutCssPath)) {
  let content = fs.readFileSync(layoutCssPath, 'utf8');
  
  // Make main wrapper flex instead of margin-based
  content = content.replace(/margin-left: 280px;/g, 'margin-left: 0; /* Changed for flex layout */');
  content = content.replace(/width: calc\(100% - 280px\);/g, 'width: 100%; flex: 1;');
  
  fs.writeFileSync(layoutCssPath, content);
}

// 2. Fix all sidebars
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
    
    // Change position: fixed to position: relative on desktop
    const positionRegex = /position:\s*fixed;\s*left:\s*0;\s*top:\s*0;/g;
    content = content.replace(positionRegex, 'position: relative;\\n  flex-shrink: 0;');
    
    // Change height: 100vh to height: 100% so it fits the floating container
    const heightRegex = /height:\s*100vh;/g;
    content = content.replace(heightRegex, 'height: 100%;');
    
    // In mobile media query, it still needs to be fixed!
    // I previously injected @media (max-width: 768px) { ... } which already has 	ransform: translateX(-100%);
    // I need to make sure mobile adds position: fixed!
    const mobileRegex = /(@media \(max-width: 768px\) \{[\s\S]*?\{)/g;
    content = content.replace(mobileRegex, '\\n    position: fixed !important;\\n    left: 0 !important;\\n    top: 0 !important;\\n    height: 100vh !important;');
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed floating layout for:', relPath);
  }
});

