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
    
    // Find and replace the .logout-btn blocks
    
    // Replace .logout-btn { ... }
    content = content.replace(/\\.logout-btn \\{[^}]+\\}/g, '.logout-btn {\\n  background: #EF4444;\\n  color: #FFFFFF;\\n  border: none;\\n  border-radius: 8px;\\n  padding: 0.75rem 1rem;\\n  display: flex;\\n  align-items: center;\\n  gap: 0.75rem;\\n  cursor: pointer;\\n  transition: all 0.2s;\\n  width: 100%;\\n}');
    
    // Replace .logout-btn .text-danger { ... }
    content = content.replace(/\\.logout-btn \\.text-danger \\{[^}]+\\}/g, '.logout-btn .text-danger {\\n  color: #FFFFFF !important;\\n}');
    
    // Replace .logout-btn:hover { ... }
    content = content.replace(/\\.logout-btn:hover \\{[^}]+\\}/g, '.logout-btn:hover {\\n  background: #DC2626;\\n  color: #FFFFFF;\\n}');
    
    // Replace .logout-btn:hover .text-danger { ... }
    content = content.replace(/\\.logout-btn:hover \\.text-danger \\{[^}]+\\}/g, '.logout-btn:hover .text-danger {\\n  color: #FFFFFF !important;\\n}');
    
    // Since some files might not match the regex perfectly because of formatting changes, let's also do a fallback replace if needed
    // Actually, regex /\\.logout-btn \\{[^}]+\\}/g should match the whole block.
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed logout button in:', relPath);
  }
});

