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
    
    // Force replace transform with margin-left
    if (content.includes('transform: translateX(-100%) !important;')) {
      // Find where it is inside min-width: 769px
      // Easiest hack: split by '@media (min-width: 769px)'
      const parts = content.split('@media (min-width: 769px)');
      if (parts.length > 1) {
        parts[1] = parts[1].replace(/transform:\\s*translateX\\(-100%\\)\\s*!important;/g, 'margin-left: -280px !important;');
        content = parts.join('@media (min-width: 769px)');
      }
    }
    
    fs.writeFileSync(fullPath, content);
  }
});

// Also fix Layout.css to ensure main-wrapper expands
const layoutCssPath = path.join(__dirname, 'src/components/layout/Layout.css');
if (fs.existsSync(layoutCssPath)) {
  let layoutContent = fs.readFileSync(layoutCssPath, 'utf8');
  if (!layoutContent.includes('.main-wrapper.sidebar-open {\\n    margin-left: 0')) {
    layoutContent += '\\n@media (min-width: 769px) {\\n  .main-wrapper.sidebar-open {\\n    margin-left: 0 !important;\\n    width: 100% !important;\\n  }\\n}\\n';
    fs.writeFileSync(layoutCssPath, layoutContent);
  }
}

