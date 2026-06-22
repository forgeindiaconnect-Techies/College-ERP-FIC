const fs = require('fs');
const file = 'src/staff/pages/StaffDashboard.jsx';
if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix Attendance Status inline style
  code = code.replace(
    /style=\{\{ background: attendancePending \? 'bg-icon-warning' : 'bg-icon-success'\.includes\("warning"\) \? "rgba\(133, 79, 11, 0\.1\)" : "rgba\(15, 110, 86, 0\.1\)", color: attendancePending \? 'bg-icon-warning' : 'bg-icon-success'\.includes\("warning"\) \? "#854F0B" : "#0F6E56" \}\}/g,
    "style={{ background: attendancePending ? 'rgba(133, 79, 11, 0.1)' : 'rgba(15, 110, 86, 0.1)', color: attendancePending ? '#854F0B' : '#0F6E56' }}"
  );

  // Fix Marks Pending inline style
  code = code.replace(
    /style=\{\{ background: marksPendingCount > 0 \? 'bg-icon-warning' : 'bg-icon-success'\.includes\("warning"\) \? "rgba\(133, 79, 11, 0\.1\)" : "rgba\(15, 110, 86, 0\.1\)", color: marksPendingCount > 0 \? 'bg-icon-warning' : 'bg-icon-success'\.includes\("warning"\) \? "#854F0B" : "#0F6E56" \}\}/g,
    "style={{ background: marksPendingCount > 0 ? 'rgba(133, 79, 11, 0.1)' : 'rgba(15, 110, 86, 0.1)', color: marksPendingCount > 0 ? '#854F0B' : '#0F6E56' }}"
  );

  fs.writeFileSync(file, code, 'utf8');
}
