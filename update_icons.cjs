const fs = require('fs');
let content = fs.readFileSync('e:/Antigravity/New folder/src/index.css', 'utf8');

const premiumIconsCSS = `
/* Premium Icon Wrappers */
.bg-icon-blue { background: rgba(59, 130, 246, 0.15) !important; color: #3b82f6 !important; }
.bg-icon-purple { background: rgba(139, 92, 246, 0.15) !important; color: #8b5cf6 !important; }
.bg-icon-orange { background: rgba(249, 115, 22, 0.15) !important; color: #f97316 !important; }
.bg-icon-green { background: rgba(16, 185, 129, 0.15) !important; color: #10b981 !important; }
.bg-icon-emerald { background: rgba(5, 150, 105, 0.15) !important; color: #059669 !important; }
.bg-icon-teal { background: rgba(20, 184, 166, 0.15) !important; color: #14b8a6 !important; }
.bg-icon-violet { background: rgba(124, 58, 237, 0.15) !important; color: #7c3aed !important; }
.bg-icon-amber { background: rgba(245, 158, 11, 0.15) !important; color: #f59e0b !important; }
.bg-icon-skyblue { background: rgba(14, 165, 233, 0.15) !important; color: #0ea5e9 !important; }
`;

content += '\n' + premiumIconsCSS;
fs.writeFileSync('e:/Antigravity/New folder/src/index.css', content, 'utf8');
console.log('Injected premium icon wrappers');
