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

const jsxFiles = findFiles(path.join(__dirname, 'src'), /\.jsx$/);

jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Since the sidebar is now dark blue in both modes, we just use the white logo.svg globally
  // We remove the dual images and put a single logo.svg back
  const dualImgRegex = /<img src="\/logo-dark\.svg" alt="ERPSYS Logo"([^>]*)logo-light-only([^>]*)\/>\s*<img src="\/logo\.svg" alt="ERPSYS Logo"([^>]*)logo-dark-only([^>]*)\/>/g;
  
  if (dualImgRegex.test(content)) {
    content = content.replace(dualImgRegex, '<img src="/logo.svg" alt="ERPSYS Logo" style={{ height: \'28px\', objectFit: \'contain\' }} />');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed Logo for Blue Theme JSX:', file);
  }
});
