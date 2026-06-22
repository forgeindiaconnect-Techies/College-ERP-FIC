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
    
    // Fix desktop toggle blank space issue
    // We want the sidebar to physically shrink to 0 width or negative margin
    // The current rule is:
    // @media (min-width: 769px) { .sidebar.sidebar-open { transform: translateX(-100%) !important; } }
    
    // Let's replace ANY block matching @media (min-width: 769px) { ... } at the end
    // Actually, just find 	ransform: translateX(-100%) !important; inside a min-width block
    
    const minWidthRegex = /@media\\s*\\(min-width:\\s*769px\\)\\s*\\{\\s*\\.([^\\s]+)\\.sidebar-open\\s*\\{\\s*transform:\\s*translateX\\(-100%\\)\\s*!important;\\s*\\}\\s*\\}/g;
    
    content = content.replace(minWidthRegex, '@media (min-width: 769px) { ..sidebar-open { margin-left: -280px !important; } }');
    
    // Let's also ensure the mobile toggle works.
    // If the sidebar is fixed inside a layout-container with overflow: hidden AND border-radius, it might be clipped.
    // Wait, on mobile, the layout-container doesn't need border-radius!
    // But anyway, if the hamburger menu doesn't work, maybe the class is NOT being added?
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed desktop toggle in:', relPath);
  }
});

// Let's also fix Layout.css to ensure layout-container doesn't clip fixed elements on mobile
const layoutCssPath = path.join(__dirname, 'src/components/layout/Layout.css');
if (fs.existsSync(layoutCssPath)) {
  let layoutContent = fs.readFileSync(layoutCssPath, 'utf8');
  if (!layoutContent.includes('@media (max-width: 768px) {\\n  .layout-container {\\n    overflow: visible;\\n    border-radius: 0;\\n  }')) {
    layoutContent += '\\n@media (max-width: 768px) {\\n  .layout-container {\\n    overflow: visible;\\n    border-radius: 0;\\n  }\\n}\\n';
    fs.writeFileSync(layoutCssPath, layoutContent);
    console.log('Fixed mobile layout clipping in Layout.css');
  }
}

