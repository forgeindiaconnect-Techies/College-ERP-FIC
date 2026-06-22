const fs = require('fs');
const path = require('path');

const findFiles = (dir, pattern) => {
  let res = [];
  fs.readdirSync(dir).forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      res = res.concat(findFiles(file, pattern));
    } else if (file.match(pattern)) {
      res.push(file);
    }
  });
  return res;
};

const jsxFiles = findFiles(path.join(__dirname, 'src'), /Sidebar\.jsx$/);
const superAdmin = path.join(__dirname, 'src/superadmin/components/SuperAdminLayout.jsx');
if (fs.existsSync(superAdmin)) jsxFiles.push(superAdmin);

jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Replace the dual logo block with a single logo.svg since the sidebar is always dark navy now.
  const regex = /<img src="\/logo-dark\.svg"[^>]*logo-light-only[^>]*>\s*<img src="\/logo\.svg"[^>]*logo-dark-only[^>]*>/g;
  if (content.match(regex)) {
    content = content.replace(regex, '<img src="/logo.svg" alt="ERPSYS Logo" style={{ height: \'32px\', objectFit: \'contain\' }} />');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed dual logo in', file);
  }
});

// Also fix the CSS hover color and the desktop close button visibility
let sidebarCss = fs.readFileSync('src/components/layout/Sidebar.css', 'utf8');

// Hide the close button on desktop
if (!sidebarCss.includes('.sidebar-close-btn { display: none !important; }')) {
  sidebarCss += '\n\n@media (min-width: 769px) {\n  .sidebar-close-btn { display: none !important; }\n}\n';
}

// Fix active link hover text color
if (!sidebarCss.includes('.nav-link.active:hover')) {
  sidebarCss += '\n\n.nav-link.active:hover { color: #ffffff !important; }\n.dark .nav-link.active:hover { color: #ffffff !important; }\n';
}

fs.writeFileSync('src/components/layout/Sidebar.css', sidebarCss);
console.log('Fixed Sidebar CSS!');
