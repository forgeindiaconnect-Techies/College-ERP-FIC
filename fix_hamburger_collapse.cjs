const fs = require('fs');
const path = require('path');

// 1. Re-add desktop sidebar collapse logic
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
    
    if (!content.includes('@media (min-width: 769px) {\n  ' + selectorClass + '.sidebar-open')) {
      content += `\n@media (min-width: 769px) {\n  ${selectorClass}.sidebar-open {\n    margin-left: -280px !important;\n  }\n}\n`;
      fs.writeFileSync(fullPath, content);
      console.log('Restored desktop collapse in:', relPath);
    }
  }
});

// 2. Restore main-wrapper expansion logic in Layout.css
const layoutCssPath = path.join(__dirname, 'src/components/layout/Layout.css');
if (fs.existsSync(layoutCssPath)) {
  let layoutContent = fs.readFileSync(layoutCssPath, 'utf8');
  if (!layoutContent.includes('@media (min-width: 769px) {\n  .main-wrapper.sidebar-open')) {
    layoutContent += '\n@media (min-width: 769px) {\n  .main-wrapper.sidebar-open {\n    margin-left: 0 !important;\n    width: 100% !important;\n  }\n}\n';
    fs.writeFileSync(layoutCssPath, layoutContent);
    console.log('Restored main-wrapper expansion in Layout.css');
  }
}

// 3. Add logo to Navbar.jsx
const navbarPath = path.join(__dirname, 'src/components/layout/Navbar.jsx');
if (fs.existsSync(navbarPath)) {
  let navbarContent = fs.readFileSync(navbarPath, 'utf8');
  if (!navbarContent.includes('className="navbar-logo"')) {
    navbarContent = navbarContent.replace(
      /<Menu size=\{20\} \/>\s*<\/button>\s*\)\}/,
      '<Menu size={20} />\n          </button>\n        )}\n        <img src="/logo.svg" alt="ERPSYS Logo" className="navbar-logo" />'
    );
    fs.writeFileSync(navbarPath, navbarContent);
    console.log('Added navbar-logo to Navbar.jsx');
  }
}

// 4. Add CSS for navbar-logo to Navbar.css
const navbarCssPath = path.join(__dirname, 'src/components/layout/Navbar.css');
if (fs.existsSync(navbarCssPath)) {
  let navbarCssContent = fs.readFileSync(navbarCssPath, 'utf8');
  if (!navbarCssContent.includes('.navbar-logo')) {
    navbarCssContent += `\n
.navbar-logo {
  height: 28px;
  object-fit: contain;
  display: none;
  transition: all 0.3s ease;
}
.sidebar-open .navbar-logo {
  display: block;
}
@media (max-width: 768px) {
  .navbar-logo { display: block; }
}
`;
    fs.writeFileSync(navbarCssPath, navbarCssContent);
    console.log('Added navbar-logo CSS to Navbar.css');
  }
}
