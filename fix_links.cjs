const fs = require('fs');
const file = 'src/principal/pages/PrincipalDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>View Profile →</span>`;

content = content.replace(target, `<span onClick={(e) => { e.stopPropagation(); navigate('/principal/hods'); }} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} className="hover-scale">View Profile →</span>`);

content = content.replace(target, `<span onClick={(e) => { e.stopPropagation(); navigate('/principal/staff'); }} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} className="hover-scale">View Profile →</span>`);

content = content.replace(target, `<span onClick={(e) => { e.stopPropagation(); navigate('/principal/students'); }} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} className="hover-scale">View Profile →</span>`);

fs.writeFileSync(file, content);
console.log('Fixed View Profile links finally');
