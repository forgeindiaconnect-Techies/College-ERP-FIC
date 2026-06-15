const fs = require('fs');

const files = [
  'e:\\\\Antigravity\\\\New folder\\\\src\\\\subadmin\\\\pages\\\\SubAdminAnnouncements.jsx',
  'e:\\\\Antigravity\\\\New folder\\\\src\\\\student\\\\pages\\\\StudentAnnouncements.jsx',
  'e:\\\\Antigravity\\\\New folder\\\\src\\\\staff\\\\pages\\\\StaffAnnouncements.jsx',
  'e:\\\\Antigravity\\\\New folder\\\\src\\\\principal\\\\pages\\\\PrincipalAnnouncements.jsx',
  'e:\\\\Antigravity\\\\New folder\\\\src\\\\pages\\\\announcements\\\\AnnouncementsManagement.jsx',
  'e:\\\\Antigravity\\\\New folder\\\\src\\\\hod\\\\pages\\\\HodAnnouncements.jsx'
];

files.forEach(file => {
  if(fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/'erp_announcements'/g, "`erp_announcements_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`");
    fs.writeFileSync(file, content);
    console.log('Patched ' + file);
  }
});
