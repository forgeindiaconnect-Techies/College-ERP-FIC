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
    
    const prefix = relPath.includes('Sidebar.css') && !relPath.includes('components/') ? '' : relPath.split('/').pop().replace('Sidebar.css', '').toLowerCase();
    const selectorClass = prefix ? `.${prefix}-sidebar` : '.sidebar';

    // The broken code looks something like:
    // .sidebar-overlay {
    //   display: none;
    // }
    //
    //
    //     position: fixed !important;
    //     left: 0 !important;
    //     top: 0 !important;
    //     height: 100vh !important;
    //     transform: translateX(-100%);
    //     z-index: 200;
    //     width: 100vw;
    //     box-shadow: 4px 0 20px rgba(0,0,0,0.3);
    //   }
    
    // We need to find this block and wrap it in the media query
    const brokenRegex = /position:\s*fixed\s*!important;\s*left:\s*0\s*!important;\s*top:\s*0\s*!important;\s*height:\s*100vh\s*!important;\s*transform:\s*translateX\(-100%\);\s*z-index:\s*200;\s*width:\s*100vw;\s*box-shadow:\s*4px 0 20px rgba\(0,0,0,0\.3\);\s*\}/g;
    
    if (brokenRegex.test(content)) {
      content = content.replace(brokenRegex, `@media (max-width: 768px) {\n  ${selectorClass} {\n    position: fixed !important;\n    left: 0 !important;\n    top: 0 !important;\n    height: 100vh !important;\n    transform: translateX(-100%);\n    z-index: 200;\n    width: 100vw;\n    box-shadow: 4px 0 20px rgba(0,0,0,0.3);\n  }`);
    }

    // Also there's another broken one at the bottom:
    //     position: fixed !important;
    //     left: 0 !important;
    //     top: 0 !important;
    //     height: 100vh !important; transform: translateX(-100%) !important; }
    //   .sidebar.sidebar-open { transform: translateX(0) !important; }
    // }
    const brokenRegex2 = /position:\s*fixed\s*!important;\s*left:\s*0\s*!important;\s*top:\s*0\s*!important;\s*height:\s*100vh\s*!important;\s*transform:\s*translateX\(-100%\)\s*!important;\s*\}/g;
    
    if (brokenRegex2.test(content)) {
      content = content.replace(brokenRegex2, `@media (max-width: 768px) {\n  ${selectorClass} {\n    position: fixed !important;\n    left: 0 !important;\n    top: 0 !important;\n    height: 100vh !important;\n    transform: translateX(-100%) !important;\n  }`);
    }

    fs.writeFileSync(fullPath, content);
    console.log('Fixed syntax errors in:', relPath);
  }
});
