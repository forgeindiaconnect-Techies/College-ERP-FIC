const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.jsx', 'utf8');

// Remove the duplicate closing tags
code = code.replace(/\)\)\}\r?\n\s*<\/ul>\r?\n\s*<\/li>\r?\n\s*\)\)\}/, '))}');

fs.writeFileSync('src/components/layout/Sidebar.jsx', code, 'utf8');
console.log('Cleaned up duplicate tags');
