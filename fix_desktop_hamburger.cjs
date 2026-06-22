const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src/components/layout/Navbar.css');
if (fs.existsSync(cssPath)) {
  let content = fs.readFileSync(cssPath, 'utf8');
  
  // We want to hide .hamburger-btn on desktop
  if (!content.includes('@media (min-width: 769px) {\\n  .hamburger-btn {\\n    display: none !important;\\n  }\\n}')) {
    content += '\\n@media (min-width: 769px) {\\n  .hamburger-btn {\\n    display: none !important;\\n  }\\n}\\n';
    fs.writeFileSync(cssPath, content);
    console.log('Fixed hamburger visibility in Navbar.css');
  }
}

