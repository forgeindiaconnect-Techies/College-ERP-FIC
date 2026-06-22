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
// Also include layout files in case they have logo imports
const layoutFiles = findFiles(path.join(__dirname, 'src'), /Layout\.jsx$/);

const allFiles = [...jsxFiles, ...layoutFiles];

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace both "/logo.svg" and "/logo.svg?v=123" with a new timestamp
  content = content.replace(/"\/logo\.svg(\?v=\d+)?"/g, '"/logo.svg?v=' + Date.now() + '"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Busted cache for logo in', file);
  }
});
