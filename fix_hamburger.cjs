const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.css', 'utf8');
code = code.replace(/\.hamburger-btn\s*\{\s*display:\s*flex;\s*align-items:\s*center;\s*justify-content:\s*center;\s*\}/, 
`.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 9999;
  cursor: pointer;
}`);
fs.writeFileSync('src/components/layout/Navbar.css', code);
console.log('Done z-index fix');
