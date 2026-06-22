const fs = require('fs');

const path = 'src/pages/departments/DepartmentDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

if (content.includes('className="dd-stat advanced-stat-box"')) {
  content = content.replace(/className="dd-stat advanced-stat-box"/g, 'className="dd-stat advanced-stat-box" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}');
  fs.writeFileSync(path, content, 'utf8');
  console.log('Fixed DepartmentDashboard.jsx');
}
