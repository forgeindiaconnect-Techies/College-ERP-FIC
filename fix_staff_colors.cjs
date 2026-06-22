const fs = require('fs');
const path = 'src/staff/pages/StaffDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Restore original classes by removing inline styles and specific bg-icon-primary strings where they were overridden
content = content.replace(/<div className="staff-stat-icon bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>\s*<Calendar size=\{22\} \/>\s*<\/div>/g, '<div className="staff-stat-icon bg-icon-primary">\n            <Calendar size={22} />\n          </div>');

content = content.replace(/<div className="staff-stat-icon bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>\s*<Clock size=\{22\} \/>\s*<\/div>/g, '<div className="staff-stat-icon bg-icon-purple">\n            <Clock size={22} />\n          </div>');

content = content.replace(/<div className="staff-stat-icon bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>\s*<Users size=\{22\} \/>\s*<\/div>/g, '<div className="staff-stat-icon bg-icon-blue">\n            <Users size={22} />\n          </div>');

content = content.replace(/<p className=\{`staff-stat-value text-sm \$\{attendancePending \? 'text-danger' : 'text-success'\}`\} style=\{\{ marginTop: "5px", fontSize: "1.2rem", fontWeight: 700, color: attendancePending \? 'text-danger' : 'text-success'\.includes\("danger"\) \? "#ef4444" : "#10b981" \}\}>\s*\{attendancePending \? 'Pending Today' : 'Logged Today'\}\s*<\/p>/g, '<p className={`staff-stat-value text-sm ${attendancePending ? \'text-danger\' : \'text-success\'}`} style={{ marginTop: "5px", fontSize: "1.2rem", fontWeight: 700 }}>\n              {attendancePending ? \'Pending Today\' : \'Logged Today\'}\n            </p>');

content = content.replace(/<div className="staff-stat-icon bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>\s*<ClipboardList size=\{22\} \/>\s*<\/div>/g, '<div className="staff-stat-icon bg-icon-indigo">\n            <ClipboardList size={22} />\n          </div>');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed StaffDashboard.jsx colors');
