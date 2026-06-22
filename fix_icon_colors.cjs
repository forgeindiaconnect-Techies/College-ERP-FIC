const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/staff/pages/StaffDashboard.css',
  'src/hod/pages/HodDashboard.css',
  'src/parent/pages/ParentDashboard.css',
  'src/driver/pages/DriverDashboard.css',
  'src/student/pages/StudentDashboard.css',
  'src/pages/departments/DepartmentDashboard.css'
];

cssFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the broken `-stat-icon.`
  content = content.replace(/\.-stat-icon\.\s*\{[^\}]+\}/g, '');

  // Add the deep indigo styles for staff-stat-icon, hod-stat-icon, etc
  const roles = ['staff', 'hod', 'parent', 'driver', 'student', 'dept'];
  
  roles.forEach(role => {
    const iconClass = `${role}-stat-icon`;
    if (content.includes(iconClass)) {
      // Find the base icon class and append the !important color override
      const override = `\n/* Forced Deep Indigo aesthetic */\n.${iconClass} { background: rgba(55, 48, 165, 0.1) !important; color: #3730A5 !important; }\n`;
      if (!content.includes('/* Forced Deep Indigo aesthetic */')) {
        content = content.replace(new RegExp(`\\.${iconClass}\\s*\\{[^\\}]+\\}`, 'g'), match => match + override);
      }
    }
  });

  fs.writeFileSync(filePath, content);
  console.log('Fixed icon colors in', file);
});
