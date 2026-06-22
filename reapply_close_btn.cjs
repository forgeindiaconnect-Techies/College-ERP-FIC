const fs = require('fs');

const cssPath = 'src/components/layout/Sidebar.css';
let content = fs.readFileSync(cssPath, 'utf8');

// 1. Add z-index and pointer-events to sidebar-close-btn
content = content.replace(
  /\.sidebar-close-btn \{[\s\S]*?\}/,
  `.sidebar-close-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--sidebar-border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  z-index: 1000;
  pointer-events: auto;
}`
);

// 2. Hide on desktop
if (!content.includes('.sidebar-close-btn { display: none !important; }')) {
  content = content.replace(
    /@media \(min-width: 769px\) \{/,
    `@media (min-width: 769px) {
  .sidebar-close-btn { display: none !important; }`
  );
}

fs.writeFileSync(cssPath, content, 'utf8');
console.log('Restored the sidebar close button fixes!');
