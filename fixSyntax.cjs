const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git') walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.jsx') || f.endsWith('.js')) callback(path.join(dir, f));
    }
  });
}

walkDir(path.join(__dirname, 'src'), (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // The literal strings in the files look like: \`erp_students_\${sessionStorage.getItem('tenantId') || 'mock_college_id'}\`
  // We need to remove the leading \ before ` and $ and }
  
  content = content.replace(/\\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  content = content.replace(/\\\}/g, '}');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Fixed syntax errors in ' + file);
  }
});
