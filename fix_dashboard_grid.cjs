const fs = require('fs');
const file = 'e:/Antigravity/New folder/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the squished stats-grid wrapper with dashboard-grid
content = content.replace(/<div className="stats-grid" style=\{\{\s*gridTemplateColumns:\s*'repeat\(auto-fit, minmax\(320px, 1fr\)\)'\s*\}\}>/g, '<div className="dashboard-grid">');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed grid class in Dashboard.jsx');
