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
    
    // Replace .logout-btn { ... }
    content = content.replace(/\.logout-btn\s*\{[^}]+\}/g, 
`.logout-btn {
  background: #EF4444;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}`);

    // Replace .logout-btn .text-danger { ... }
    content = content.replace(/\.logout-btn\s*\.text-danger\s*\{[^}]+\}/g, 
`.logout-btn .text-danger {
  color: #FFFFFF !important;
}`);

    // Replace .logout-btn:hover { ... }
    content = content.replace(/\.logout-btn:hover\s*\{[^}]+\}/g, 
`.logout-btn:hover {
  background: #DC2626;
  color: #FFFFFF;
}`);

    // Replace .logout-btn:hover .text-danger { ... }
    content = content.replace(/\.logout-btn:hover\s*\.text-danger\s*\{[^}]+\}/g, 
`.logout-btn:hover .text-danger {
  color: #FFFFFF !important;
}`);

    fs.writeFileSync(fullPath, content);
    console.log('Fixed logout button in:', relPath);
  }
});
