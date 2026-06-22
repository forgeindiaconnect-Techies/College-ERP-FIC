const fs = require('fs');
let css = fs.readFileSync('e:/Antigravity/New folder/src/components/layout/Sidebar.css', 'utf8');

// Strip out the bad unicode characters created by powershell echo
css = css.replace(/\x00/g, '');

const appended = `
/* Sidebar Group Headers */
.nav-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  margin: 0.2rem 1rem;
  border-radius: 8px;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-group-header:hover {
  background-color: var(--sidebar-hover);
  color: var(--sidebar-text);
}

.nav-group-items {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
}

.nav-group-items.collapsed {
  max-height: 0;
}

.nav-group-items.expanded {
  max-height: 500px;
}
`;

// Avoid duplicating if we run it multiple times
if (!css.includes('.nav-group-header')) {
  fs.writeFileSync('e:/Antigravity/New folder/src/components/layout/Sidebar.css', css + appended, 'utf8');
} else {
  // Overwrite fully to fix the encoding anyway
  const clean = css.substring(0, css.indexOf('/* Sidebar Group Headers */')) + appended;
  fs.writeFileSync('e:/Antigravity/New folder/src/components/layout/Sidebar.css', clean, 'utf8');
}
