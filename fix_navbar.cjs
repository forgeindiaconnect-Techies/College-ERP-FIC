const fs = require('fs');
const file = 'e:/Antigravity/New folder/src/components/layout/Navbar.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\.navbar\s*\{[^}]+\}/, `.navbar {
  min-height: 70px;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0.75rem 2rem !important;
  position: sticky;
  top: 0;
  z-index: 90;
  border-radius: 0 !important;
  box-shadow: var(--shadow-sm);
  flex-wrap: nowrap !important;
  gap: 1rem;
}`);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Navbar CSS');
