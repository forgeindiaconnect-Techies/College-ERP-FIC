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
  let originalContent = content;

  // Add cache buster to logo
  content = content.replace(/"\/logo\.svg"/g, '"/logo.svg?v=' + Date.now() + '"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Busted cache for logo in', file);
  }
});
