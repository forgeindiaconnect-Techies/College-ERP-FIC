const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      content = content.replace(/className=[\"']([a-z]+)-stat-card([^\"']*)[\"']/g, 'className=\"stat-card$2\"');
      content = content.replace(/className=[\"']([a-z]+)-chart-card([^\"']*)[\"']/g, 'className=\"glass-card$2\"');
      content = content.replace(/className=[\"']([a-z]+)-list-card([^\"']*)[\"']/g, 'className=\"glass-card$2\"');
      content = content.replace(/className=[\"']([a-z]+)-table-card([^\"']*)[\"']/g, 'className=\"glass-card$2\"');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Standardized classes in', fullPath);
      }
    }
  }
}
processDir('./src');
