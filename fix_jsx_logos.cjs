const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/student/components/StudentSidebar.css',
  'src/staff/components/StaffSidebar.css',
  'src/parent/components/ParentSidebar.css',
  'src/hod/components/HodSidebar.css',
  'src/components/layout/Sidebar.css',
  'src/driver/components/DriverSidebar.css',
  'src/accounts/components/AccountsSidebar.css'
];

cssFiles.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // Revert the content trick
    content = content.replace(/.*content: url\('\/logo-dark\.svg'\).*\n?/g, '');
    content = content.replace(/.*content: url\('\/logo\.svg'\).*\n?/g, '');
    fs.writeFileSync(fullPath, content);
  }
});

const globalCssPath = path.join(__dirname, 'src/components/layout/Sidebar.css');
if (fs.existsSync(globalCssPath)) {
  let content = fs.readFileSync(globalCssPath, 'utf8');
  if (!content.includes('.logo-light-only')) {
    content += '\n\n.logo-light-only { display: block; }\n.logo-dark-only { display: none; }\n.dark .logo-light-only { display: none; }\n.dark .logo-dark-only { display: block; }\n';
    fs.writeFileSync(globalCssPath, content);
  }
}

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

const jsxFiles = findFiles(path.join(__dirname, 'src'), /\.jsx$/);

jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Replace single image with two images
  const imgRegex = /<img src="\/logo\.svg" alt="ERPSYS Logo"([^>]*)\/>/g;
  if (imgRegex.test(content) && !content.includes('logo-light-only')) {
    content = content.replace(imgRegex, (match, attrs) => {
      if (attrs.includes("width: '240px'") || attrs.includes("width: '140px'")) return match;
      
      let attrsLight = attrs;
      let attrsDark = attrs;
      
      if (attrs.includes('className=')) {
        attrsLight = attrs.replace(/className="([^"]+)"/, 'className="$1 logo-light-only"');
        attrsDark = attrs.replace(/className="([^"]+)"/, 'className="$1 logo-dark-only"');
      } else {
        attrsLight = ' className="logo-light-only"' + attrs;
        attrsDark = ' className="logo-dark-only"' + attrs;
      }
      
      return `<img src="/logo-dark.svg" alt="ERPSYS Logo"${attrsLight}/>\n        <img src="/logo.svg" alt="ERPSYS Logo"${attrsDark}/>`;
    });
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated JSX:', file);
  }
});
