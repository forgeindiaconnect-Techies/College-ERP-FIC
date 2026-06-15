const fs = require('fs');
const path = require('path');
const routesDir = path.join(__dirname, 'backend', 'routes');

const files = fs.readdirSync(routesDir);
let changedCount = 0;

for (const file of files) {
  if (!file.endsWith('.js')) continue;
  let content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  
  if (content.includes('authMiddleware') && !content.includes('collegeScope')) {
    content = content.replace(/import\s+\{([^}]*)\}\s+from\s+'([^']*)authMiddleware(\.js)?';/, (match, p1, p2, p3) => {
      return `import { ${p1.trim()}, collegeScope } from '${p2}authMiddleware${p3 || ''}';`;
    });
  }

  let original = content;

  content = content.replace(/(router\.(get|post|put|delete|patch)\([^,]+,\s*protect,\s*.*?)(?<!collegeScope,\s*)(async\s*\(\s*req,\s*res)/g, "$1collegeScope, $3");

  if (content !== original) {
    fs.writeFileSync(path.join(routesDir, file), content);
    console.log('Patched routes in ' + file);
    changedCount++;
  }
}
console.log('Total files patched: ' + changedCount);
