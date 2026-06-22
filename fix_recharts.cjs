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

const jsxFiles = findFiles(path.join(__dirname, 'src'), /\.jsx$/);
jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('height="100%"') && content.includes('<ResponsiveContainer')) {
    content = content.replace(/<ResponsiveContainer\s+([^>]*?)height="100%"/g, '<ResponsiveContainer $1height={300}');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed ResponsiveContainer height in', file);
  }
});
