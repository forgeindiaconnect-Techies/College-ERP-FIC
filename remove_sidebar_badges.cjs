const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src');

const replacements = [
  {
    file: path.join(rootDir, 'hod', 'components', 'HodSidebar.jsx'),
    regex: /\{\/\*\s*Dept Badge\s*\*\/\}\s*<div className="hod-dept-card">[\s\S]*?<ChevronRight[^>]*\/>\s*<\/div>/,
  },
  {
    file: path.join(rootDir, 'staff', 'components', 'StaffSidebar.jsx'),
    regex: /\{\/\*\s*Dept Badge\s*\*\/\}\s*<div className="staff-dept-card">[\s\S]*?<ChevronRight[^>]*\/>\s*<\/div>/,
  },
  {
    file: path.join(rootDir, 'student', 'components', 'StudentSidebar.jsx'),
    regex: /\{\/\*\s*Student Badge Card\s*\*\/\}\s*<div className="student-profile-badge-card">[\s\S]*?<ChevronRight[^>]*\/>\s*<\/div>/,
  },
  {
    file: path.join(rootDir, 'accounts', 'components', 'AccountsSidebar.jsx'),
    regex: /\{\/\*\s*Account Badge Card\s*\*\/\}\s*<div className="accounts-profile-badge-card">[\s\S]*?<ChevronRight[^>]*\/>\s*<\/div>/,
  },
  {
    file: path.join(rootDir, 'parent', 'components', 'ParentSidebar.jsx'),
    regex: /\{\/\*\s*Parent Badge Card\s*\*\/\}\s*<div className="parent-profile-badge-card">[\s\S]*?<ChevronRight[^>]*\/>\s*<\/div>/,
  }
];

let modified = 0;

replacements.forEach(rep => {
  if (fs.existsSync(rep.file)) {
    let content = fs.readFileSync(rep.file, 'utf8');
    if (rep.regex.test(content)) {
      content = content.replace(rep.regex, '');
      fs.writeFileSync(rep.file, content, 'utf8');
      console.log(`Patched ${path.basename(rep.file)}`);
      modified++;
    } else {
      console.log(`Regex did not match in ${path.basename(rep.file)}`);
    }
  } else {
    console.log(`File not found: ${rep.file}`);
  }
});

console.log(`Done. Modified ${modified} files.`);
