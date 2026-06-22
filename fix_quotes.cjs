const fs = require('fs');
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

  // Fix mismatched quotes exactly as they appear in the Vite error
  // className={({ isActive }) => isActive ? "nav-link active' : "nav-link'}
  content = content.replace(/"nav-link active'/g, "'nav-link active'");
  content = content.replace(/"nav-link'/g, "'nav-link'");
  
  // Just to be perfectly sure we don't have backticks or other weird mismatches
  content = content.replace(/"nav-link active`/g, "`nav-link active`");
  content = content.replace(/"nav-link`/g, "`nav-link`");

  // Actually, wait, let's just use double quotes everywhere since I replaced the start with a double quote!
  content = content.replace(/"nav-link active'/g, '"nav-link active"');
  content = content.replace(/"nav-link'/g, '"nav-link"');
  
  // Fallback for single quote start double quote end:
  content = content.replace(/'nav-link active"/g, '"nav-link active"');
  content = content.replace(/'nav-link"/g, '"nav-link"');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed mismatched quotes');
