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
  
  // The broken JSX looks like this:
  // <button className="logout-btn" onClick={handleLogout}> e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
  //   onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
  // >
  
  // We need to clean this up and just make it `<button className="logout-btn" onClick={handleLogout}>`
  
  const brokenSyntaxRegex = /<button className="logout-btn" onClick=\{handleLogout\}>\s*e\.currentTarget\.style\.background\s*=\s*'rgba\(239, 68, 68, 0\.1\)'\}\s*onMouseOut=\{\(e\)\s*=>\s*e\.currentTarget\.style\.background\s*=\s*'transparent'\}\s*>/g;
  
  if (brokenSyntaxRegex.test(content)) {
    content = content.replace(brokenSyntaxRegex, '<button className="logout-btn" onClick={handleLogout}>');
    changed = true;
  }
  
  // Some sidebars might have a different transparent string
  const brokenSyntaxRegex2 = /<button className="logout-btn" onClick=\{handleLogout\}>\s*e\.currentTarget\.style\.background\s*=\s*'[^']+'\}\s*onMouseOut=\{\(e\)\s*=>\s*e\.currentTarget\.style\.background\s*=\s*'[^']+'\}\s*>/g;
  
  if (brokenSyntaxRegex2.test(content)) {
    content = content.replace(brokenSyntaxRegex2, '<button className="logout-btn" onClick={handleLogout}>');
    changed = true;
  }
  
  // If there are still any broken ones, we can match:
  // `<button className="logout-btn" onClick={handleLogout}> e.currentTarget... >`
  const fallbackRegex = /<button className="logout-btn" onClick=\{handleLogout\}>[\s\S]*?onMouseOut=[\s\S]*?>/g;
  if (fallbackRegex.test(content)) {
    content = content.replace(fallbackRegex, '<button className="logout-btn" onClick={handleLogout}>');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed broken JSX in:', file);
  }
});
