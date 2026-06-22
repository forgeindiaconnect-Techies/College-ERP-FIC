const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return filelist;
      } else {
        throw err;
      }
    }
  });
  return filelist;
};

const fixAllDashboards = () => {
  const files = walkSync('src').filter(f => f.endsWith('Dashboard.jsx'));
  
  // Also fix MetricCards.css forcefully
  const metricCardsPath = 'src/components/layout/MetricCards.css';
  if (fs.existsSync(metricCardsPath)) {
    const cssContent = `/* src/components/layout/MetricCards.css */
.stat-card, .hod-stat-card, .staff-stat-card, .s-metric-card {
  border: 1px solid var(--border-color) !important;
  box-shadow: var(--shadow-sm) !important;
  border-radius: 12px !important;
  background-color: var(--bg-card) !important;
  transition: all 0.3s ease !important;
}
.stat-card:hover, .hod-stat-card:hover, .staff-stat-card:hover, .s-metric-card:hover {
  box-shadow: var(--shadow-md) !important;
  transform: translateY(-2px);
}
.stat-card h3, .stat-card p, .stat-card span, .stat-card h2,
.hod-stat-card p, .staff-stat-card p,
.s-metric-card span, .s-metric-card h2 {
  color: var(--text-main) !important;
  text-transform: none !important;
}
.stat-card p.stat-change, .stat-card span.stat-change, .stat-change.text-muted {
  color: var(--text-muted) !important;
}
.stat-card .stat-change.positive, .hod-stat-card .text-success, .staff-stat-card .text-success, .s-metric-card .text-success {
  color: var(--success) !important;
  font-weight: 600 !important;
}
.stat-card .stat-change.negative, .hod-stat-card .text-danger, .staff-stat-card .text-danger, .s-metric-card .text-danger {
  color: var(--danger) !important;
  font-weight: 600 !important;
}`;
    fs.writeFileSync(metricCardsPath, cssContent, 'utf8');
  }

  files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Fix ALL bg-icon-* classes to bg-icon-primary
    const regexIcons = /bg-icon-(blue|purple|orange|green|emerald|teal|pink|red|cyan|skyblue|indigo|royalblue|amber|violet)/g;
    if (regexIcons.test(code)) {
      code = code.replace(regexIcons, 'bg-icon-primary');
      changed = true;
    }

    // 2. Exception: Avg Attendance -> bg-icon-warning
    if (code.includes('Avg Attendance') && code.includes('bg-icon-primary')) {
      code = code.replace(
        /<div className="stat-icon-wrapper bg-icon-primary">\s*<CalendarCheck/g,
        '<div className="stat-icon-wrapper bg-icon-warning">\n            <CalendarCheck'
      );
      changed = true;
    }

    // 3. Banners: Replace gradients with var(--primary)
    const bannerRegex = /background:\s*'linear-gradient\([^)]+\)'/g;
    if (bannerRegex.test(code)) {
      code = code.replace(/background:\s*'linear-gradient\([^)]+\)'/g, "background: 'var(--primary)'");
      changed = true;
    }

    // 4. Live DB Sync / Live Sync pills
    const syncRegex = /<div style={{[^}]*}}>\s*<span style={{[^}]*background:\s*'#10b981'[^}]*}}\s*\/>\s*(Live Sync|Live DB Sync)\s*<\/div>/g;
    if (syncRegex.test(code)) {
      code = code.replace(
        /<div style={{[^}]*}}>\s*<span style={{[^}]*background:\s*'#10b981'[^}]*}}\s*\/>\s*(Live Sync|Live DB Sync)\s*<\/div>/g,
        `<div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(15, 110, 86, 0.1)', border: '1px solid rgba(15, 110, 86, 0.2)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', boxShadow: '0 0 0 2px rgba(15, 110, 86, 0.2)', animation: 'pulse 2s infinite' }} />
            $1
          </div>`
      );
      changed = true;
    }

    // 5. Hardcoded Tailwind classes on cards?
    // Let's remove bg-blue-50, bg-purple-50, bg-orange-50, bg-emerald-50, bg-pink-50 from classNames
    const tailwindBgRegex = /bg-(blue|purple|orange|emerald|pink|teal|indigo|violet|red|green|cyan|sky)-50/g;
    if (tailwindBgRegex.test(code)) {
      code = code.replace(tailwindBgRegex, '');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, code, 'utf8');
      console.log('Fixed', file);
    }
  });
};

fixAllDashboards();
