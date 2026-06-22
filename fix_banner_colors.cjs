const fs = require('fs');

// 1. HodDashboard.css
const hodCssPath = 'src/hod/pages/HodDashboard.css';
let hodCssContent = fs.readFileSync(hodCssPath, 'utf8');
hodCssContent = hodCssContent.replace(
  /background: linear-gradient\([^)]+\);/,
  "background: #3730A5;\n    box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3);"
);
fs.writeFileSync(hodCssPath, hodCssContent, 'utf8');

// 2. StaffDashboard.css
const staffCssPath = 'src/staff/pages/StaffDashboard.css';
let staffCssContent = fs.readFileSync(staffCssPath, 'utf8');
staffCssContent = staffCssContent.replace(
  /background: linear-gradient\([^)]+\);/,
  "background: #3730A5;\n    box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3);"
);
fs.writeFileSync(staffCssPath, staffCssContent, 'utf8');

console.log('Fixed banner colors in CSS files');
