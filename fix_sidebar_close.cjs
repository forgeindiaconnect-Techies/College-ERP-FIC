const fs = require('fs');

const cssPath = 'src/components/layout/Sidebar.css';
let content = fs.readFileSync(cssPath, 'utf8');

if (!content.includes('.sidebar-close-btn { display: none !important; }')) {
  content = content.replace(
    /@media \(min-width: 769px\) \{/,
    `@media (min-width: 769px) {
  .sidebar-close-btn { display: none !important; }`
  );
  fs.writeFileSync(cssPath, content, 'utf8');
  console.log('Fixed sidebar close button visibility on desktop');
} else {
  console.log('Already fixed');
}
