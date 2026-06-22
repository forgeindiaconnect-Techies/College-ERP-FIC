const fs = require('fs');
const path = require('path');

const sidebars = [
  'src/student/components/StudentSidebar.jsx',
  'src/staff/components/StaffSidebar.jsx',
  'src/hod/components/HodSidebar.jsx',
  'src/principal/components/PrincipalSidebar.jsx',
  'src/parent/components/ParentSidebar.jsx',
  'src/driver/components/DriverSidebar.jsx',
  'src/accounts/components/AccountsSidebar.jsx',
  'src/components/layout/Sidebar.jsx',
  'src/subadmin/components/SubAdminSidebar.jsx'
];

for (const relPath of sidebars) {
  const file = 'e:/Antigravity/New folder/' + relPath;
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');

  // Fix CSS imports
  content = content.replace(/import ['"]\.\/(.*?)Sidebar\.css['"];/g, "import '../../components/layout/Sidebar.css';");

  // Fix custom class names
  content = content.replace(/className="[a-z]+-sidebar"/g, 'className="sidebar"');
  content = content.replace(/className=\{(.*?)[a-z]+-sidebar/g, 'className={$1sidebar');
  content = content.replace(/className="[a-z]+-sidebar-header"/g, 'className="sidebar-header"');
  content = content.replace(/className="[a-z]+-nav"/g, 'className="sidebar-nav"');
  content = content.replace(/['"][a-z]+-nav-link\b/g, '"nav-link');
  content = content.replace(/['"][a-z]+-nav-link active['"]/g, '"nav-link active"');
  
  // Fix Icon sizes from 18 or 19 to 20
  content = content.replace(/size=\{18\}/g, 'size={20}');
  content = content.replace(/size=\{19\}/g, 'size={20}');
  
  // Fix nested menu padding to fit new layout
  content = content.replace(/paddingLeft:\s*['"]3rem['"]/g, "paddingLeft: '2.8rem'");
  
  // Replace the logout footer border
  content = content.replace(/borderTop:\s*['"]1px solid rgba\(255,255,255,0\.05\)['"]/g, "borderTop: '1px solid var(--sidebar-border)'");

  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + relPath);
}

// Delete redundant CSS files
const redundantCSS = [
  'src/student/components/StudentSidebar.css',
  'src/staff/components/StaffSidebar.css',
  'src/hod/components/HodSidebar.css',
  'src/parent/components/ParentSidebar.css',
  'src/driver/components/DriverSidebar.css',
  'src/accounts/components/AccountsSidebar.css',
  'src/principal/components/PrincipalSidebar.css'
];

for (const relCSS of redundantCSS) {
  const file = 'e:/Antigravity/New folder/' + relCSS;
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log('Deleted redundant CSS: ' + relCSS);
  }
}
