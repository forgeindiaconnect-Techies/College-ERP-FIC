const fs = require('fs');

let c = fs.readFileSync('src/index.css', 'utf8');

// Set Sidebar Background to Dark Navy
c = c.replace(/--sidebar-bg: #[0-9A-Fa-f]+;/g, '--sidebar-bg: #15113A;');

// Fix logo hiding logic to use body.dark
c = c.replace(/html\[data-theme="dark"\]/g, 'body.dark');
c = c.replace(/html\[data-theme="light"\]/g, 'body:not(.dark)');

fs.writeFileSync('src/index.css', c);

let sidebarCss = fs.readFileSync('src/components/layout/Sidebar.css', 'utf8');

// Ensure Active Tab uses Deep Indigo bubble
sidebarCss = sidebarCss.replace(/\.nav-link\.active\s*\{[^}]+\}/g, '.nav-link.active { background: #3C3489; color: #ffffff; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(60, 52, 137, 0.4); border-left: none; }');
sidebarCss = sidebarCss.replace(/\.dark\s+\.nav-link\.active\s*\{[^}]+\}/g, '.dark .nav-link.active { background: #3C3489; color: #ffffff; border-radius: 12px; font-weight: 600; border-left: none; box-shadow: 0 4px 12px rgba(60, 52, 137, 0.4); }');

fs.writeFileSync('src/components/layout/Sidebar.css', sidebarCss);

console.log("Updated colors and logos!");
