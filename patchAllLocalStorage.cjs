const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.jsx') || f.endsWith('.js')) {
        callback(path.join(dir, f));
      }
    }
  });
}

const targetKeys = [
  'erp_students', 'erp_attendance', 'erp_timetable', 'erp_leave_requests',
  'erp_subjects', 'principal_anonymous_complaints', 'erp_expenses', 
  'erp_scholarships', 'erp_communication_logs', 'principal_academic_planning',
  'erp_hostel_leaves', 'erp_hostel_attendance', 'erp_hostel_visitors', 'erp_mess_menu'
];

walkDir(path.join(__dirname, 'src'), (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  targetKeys.forEach(key => {
    // Replace 'key' or "key" with `key_${sessionStorage.getItem('tenantId') || 'mock_college_id'}`
    const regex = new RegExp(`(['"])${key}\\1`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, "\\`" + key + "_\\${sessionStorage.getItem('tenantId') || 'mock_college_id'}\\`");
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Patched local storage keys in ' + file);
  }
});
