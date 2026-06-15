const fs = require('fs');

const files = [
  'e:\\\\Antigravity\\\\New folder\\\\src\\\\staff\\\\pages\\\\StaffDashboard.jsx',
  'e:\\\\Antigravity\\\\New folder\\\\src\\\\staff\\\\pages\\\\StaffAssignments.jsx',
  'e:\\\\Antigravity\\\\New folder\\\\src\\\\principal\\\\pages\\\\PrincipalAssignments.jsx',
  'e:\\\\Antigravity\\\\New folder\\\\src\\\\pages\\\\assignments\\\\AdminAssignments.jsx'
];

files.forEach(file => {
  if(fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/'erp_assignments'/g, "`erp_assignments_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`");
    fs.writeFileSync(file, content);
    console.log('Patched ' + file);
  }
});
