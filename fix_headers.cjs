const fs = require('fs');
const file = 'e:/Antigravity/New folder/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add imports
if (!content.includes('ClipboardList')) {
  content = content.replace('Crown\n} from \'lucide-react\';', 'Crown,\n  ClipboardList,\n  Rocket\n} from \'lucide-react\';');
}

// Replace Logs header
const logRegex = /<div className="glass-card" style=\{\{\s*padding:\s*'1\.5rem'\s*\}\}>\s*<h3>📋 Recent Global Operations Logs<\/h3>\s*<div style=\{\{\s*marginTop:\s*'1rem',\s*maxHeight:\s*'200px',\s*overflowY:\s*'auto'\s*\}\}>/g;
content = content.replace(logRegex, 
  `<div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="bg-icon-purple" style={{ padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <ClipboardList size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.02em', textTransform: 'none' }}>Recent Global Operations Logs</h3>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>`);

// Replace Modules header
const modRegex = /<div className="glass-card" style=\{\{\s*padding:\s*'1\.5rem'\s*\}\}>\s*<h3>🚀 Secondary System Modules<\/h3>\s*<div style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'1fr 1fr',\s*gap:\s*'1rem',\s*marginTop:\s*'1rem'\s*\}\}>/g;
content = content.replace(modRegex,
  `<div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="bg-icon-orange" style={{ padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <Rocket size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.02em', textTransform: 'none' }}>Secondary System Modules</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>`);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed headers to use lucide icons');
