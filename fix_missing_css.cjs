const fs = require('fs');
const glob = require('fs'); // wait, I will just iterate them

const filesToFix = [
  'src/student/components/StudentSidebar.jsx',
  'src/staff/components/StaffSidebar.jsx',
  'src/parent/components/ParentSidebar.jsx',
  'src/hod/components/HodSidebar.jsx'
];

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace import './...Sidebar.css'
    content = content.replace(/import '\.\/[a-zA-Z]+Sidebar\.css';/, "import '../../components/layout/Sidebar.css';");

    // Replace custom classes with standard ones
    content = content.replace(/student-sidebar/g, 'sidebar');
    content = content.replace(/student-nav-link/g, 'nav-link');
    content = content.replace(/staff-sidebar/g, 'sidebar');
    content = content.replace(/staff-nav-link/g, 'nav-link');
    content = content.replace(/parent-sidebar/g, 'sidebar');
    content = content.replace(/parent-nav-link/g, 'nav-link');
    content = content.replace(/hod-sidebar/g, 'sidebar');
    content = content.replace(/hod-nav-link/g, 'nav-link');

    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log('Fixed missing CSS imports and classes');
