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
    
    // Explicitly replace the exact string without regex just to be safe
    content = content.replace('transform: translateX(-100%) !important;', 'margin-left: -280px !important;');
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed margin in:', relPath);
  }
});

const layoutCssPath = path.join(__dirname, 'src/components/layout/Layout.css');
if (fs.existsSync(layoutCssPath)) {
  let layoutContent = fs.readFileSync(layoutCssPath, 'utf8');
  if (!layoutContent.includes('.main-wrapper.sidebar-open {')) {
    layoutContent += '\n@media (min-width: 769px) {\n  .main-wrapper.sidebar-open {\n    margin-left: 0 !important;\n    width: 100% !important;\n  }\n}\n';
    fs.writeFileSync(layoutCssPath, layoutContent);
    console.log('Fixed Layout.css');
  }
}
