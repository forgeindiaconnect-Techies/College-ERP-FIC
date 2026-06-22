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

jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Only target the specific <aside className="sidebar"> line
  if (content.includes('<aside className="sidebar">')) {
    content = content.replace(/<aside className="sidebar">/g, '<aside className={`sidebar ${isOpen ? \'sidebar-open\' : \'\'}`}>');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed sidebar class in', file);
  }
});
