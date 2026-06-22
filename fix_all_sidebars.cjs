const fs = require('fs');
const path = require('path');

const findFiles = (dir, pattern) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file, pattern));
    } else {
      if (file.match(pattern)) results.push(file);
    }
  });
  return results;
};

const jsxFiles = findFiles(path.join(__dirname, 'src'), /Sidebar\.jsx$/);
const superAdmin = path.join(__dirname, 'src/superadmin/components/SuperAdminLayout.jsx');
if (fs.existsSync(superAdmin)) jsxFiles.push(superAdmin);

jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // 1. Restore the dual logos
  const wrongLogoRegex = /<img src="\/logo\.svg" alt="ERPSYS Logo" style=\{\{\s*height:\s*'28px',\s*objectFit:\s*'contain'\s*\}\}\s*\/>/g;
  if (wrongLogoRegex.test(content)) {
    content = content.replace(wrongLogoRegex, `<img src="/logo-dark.svg" alt="ERPSYS Logo" className="logo-light-only" style={{ height: '32px', objectFit: 'contain' }} />\n          <img src="/logo.svg" alt="ERPSYS Logo" className="logo-dark-only" style={{ height: '32px', objectFit: 'contain' }} />`);
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Restored Dual Logos in:', file);
  }
});
