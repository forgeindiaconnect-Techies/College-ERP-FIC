const fs = require('fs');
const file = 'e:/Antigravity/New folder/src/components/layout/Navbar.css';
let content = fs.readFileSync(file, 'utf8');

// Force navbar-left to flex-start
if (!content.includes('justify-content: flex-start !important;')) {
  content = content.replace(/\.navbar-left\s*\{/, '.navbar-left {\n  justify-content: flex-start !important;\n');
}

// Remove the problematic sidebar-open logo rule that might be pushing things
content = content.replace(/\.sidebar-open \.navbar-logo\s*\{\s*display:\s*block;\s*\}/, '/* removed problematic logo rule */');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Navbar-left alignment and logo rule');
