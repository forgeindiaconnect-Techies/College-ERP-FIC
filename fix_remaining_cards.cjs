const fs = require('fs');

const cardMarkup = `          <div key={i} className="stat-card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid #E3E5EC', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: 'none' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bgTint, color: s.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{s.label}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1.1' }}>{s.value}</span>
              <span style={{ fontSize: '0.75rem', color: s.subColor || 'var(--text-muted)', fontWeight: s.subColor ? 600 : 400 }}>{s.sub}</span>
            </div>
          </div>`;

const processFile = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace colors with the new standard tints
  content = content.replace(/color:\s*'#10b981'/g, `bgTint: '#E1F5EE', iconColor: '#047857', subColor: '#047857'`);
  content = content.replace(/color:\s*'#6366[fF]1'/g, `bgTint: '#EEEDFE', iconColor: '#3C3489'`);
  content = content.replace(/color:\s*'#ef4444'/g, `bgTint: '#FCEBEB', iconColor: '#DC2626', subColor: '#DC2626'`);
  content = content.replace(/color:\s*'#f59e0b'/g, `bgTint: '#FAEEDA', iconColor: '#B45309', subColor: '#B45309'`);
  content = content.replace(/color:\s*'#0ea5e9'/g, `bgTint: '#E1F5EE', iconColor: '#047857'`);
  content = content.replace(/color:\s*'#ec4899'/g, `bgTint: '#EEEDFE', iconColor: '#3C3489'`);

  // Replace the card markup
  content = content.replace(/<div key=\{i\} className="stat-card" style=\{\{ borderBottom: `3px solid \$\{s\.color\}` \}\}>[\s\S]*?<\/div>\s*<\/div>/g, cardMarkup);

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
};

const files = [
  'src/principal/pages/PrincipalAttendanceAnalytics.jsx',
  'src/principal/pages/PrincipalExamsResults.jsx',
  'src/principal/pages/PrincipalFeesOverview.jsx',
  'src/principal/pages/PrincipalPlacements.jsx'
];

files.forEach(processFile);
