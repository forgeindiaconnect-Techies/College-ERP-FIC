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
  
  if (content.includes('"nav-link active\' : "nav-link\'}')) {
    content = content.replace(/"nav-link active' : "nav-link'}/g, "'nav-link active' : 'nav-link'}");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed quotes in:', file);
  }
});
