const fs = require('fs');
let c = fs.readFileSync('src/components/layout/GlobalLockdown.jsx', 'utf8');
const replacement = `const LOCKED_MODULES = [
  { label: 'Students', emoji: '👥' },
  { label: 'Attendance', emoji: '📅' },
  { label: 'Exams & Marks', emoji: '📝' },
  { label: 'Fees & Acc', emoji: '💰' },
  { label: 'Payroll', emoji: '💸' },
  { label: 'Reports', emoji: '📊' },
];`;
c = c.replace(/const LOCKED_MODULES = \[\s*\{[\s\S]*?\];/g, replacement);
fs.writeFileSync('src/components/layout/GlobalLockdown.jsx', c);
