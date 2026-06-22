const fs = require('fs');
let file = 'src/principal/pages/PrincipalDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The original line:
// <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(15, 110, 86, 0.1)', border: '1px solid var(--border-color)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
//   <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', boxShadow: '0 0 0 2px rgba(15, 110, 86, 0.2)', animation: 'pulse 2s infinite' }} />

content = content.replace(/background:\s*'rgba\(15,\s*110,\s*86,\s*0\.1\)'/, "background: 'rgba(255, 255, 255, 0.15)'");
content = content.replace(/color:\s*'var\(--success\)'/, "color: '#ffffff'");
content = content.replace(/border:\s*'1px solid var\(--border-color\)'/, "border: '1px solid rgba(255, 255, 255, 0.2)'");

content = content.replace(/background:\s*'var\(--success\)'/, "background: '#4ade80'");
content = content.replace(/boxShadow:\s*'0 0 0 2px rgba\(15,\s*110,\s*86,\s*0\.2\)'/, "boxShadow: '0 0 0 2px rgba(74, 222, 128, 0.3)'");

fs.writeFileSync(file, content);
console.log('Fixed Live DB Sync badge');
