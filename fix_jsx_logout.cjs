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

jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Replace the massive inline button block with a clean className="logout-btn"
  // The block looks like:
  // <button 
  //   onClick={handleLogout} 
  //   style={{ width: '100%', ... }}
  //   onMouseOver={...}
  //   onMouseOut={...}
  // >
  
  const robustBtnRegex = /<button[^>]*onClick=\{handleLogout\}[^>]*style=\{\{[^}]+\}\}[^>]*>/g;
  if (robustBtnRegex.test(content)) {
    content = content.replace(robustBtnRegex, '<button className="logout-btn" onClick={handleLogout}>');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed JSX inline logout in:', file);
  }
});
