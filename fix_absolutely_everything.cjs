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

const fixAbsolutelyEverything = () => {
  const files = walkSync('src').filter(f => f.endsWith('.jsx'));

  files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Fix ALL stat card icons
    const regexIcons = /bg-icon-(blue|purple|orange|green|emerald|teal|pink|red|cyan|skyblue|indigo|royalblue|amber|violet)/g;
    if (regexIcons.test(code)) {
      code = code.replace(regexIcons, 'bg-icon-primary');
      changed = true;
    }

    // 2. Exception for Avg Attendance
    if (code.includes('Avg Attendance') && code.includes('bg-icon-primary')) {
      code = code.replace(
        /<div className="stat-icon-wrapper bg-icon-primary">\s*<CalendarCheck/g,
        '<div className="stat-icon-wrapper bg-icon-warning">\n            <CalendarCheck'
      );
      changed = true;
    }

    // 3. Fix ALL Banners (linear gradients that have primary or similar)
    const bannerRegex = /background:\s*['"]linear-gradient\([^)]+\)['"]/g;
    if (bannerRegex.test(code)) {
      code = code.replace(/background:\s*['"]linear-gradient\([^)]+\)['"]/g, "background: 'var(--primary)'");
      changed = true;
    }

    // 4. Fix ALL Live Sync / DB Sync pills
    const syncRegex = /<div style={{[^}]*}}>\s*<span style={{[^}]*background:\s*['"]#10b981['"][^}]*}}\s*\/>\s*(Live Sync|Live DB Sync)\s*<\/div>/g;
    if (syncRegex.test(code)) {
      code = code.replace(
        /<div style={{[^}]*}}>\s*<span style={{[^}]*background:\s*['"]#10b981['"][^}]*}}\s*\/>\s*(Live Sync|Live DB Sync)\s*<\/div>/g,
        `<div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(15, 110, 86, 0.1)', border: '1px solid rgba(15, 110, 86, 0.2)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', boxShadow: '0 0 0 2px rgba(15, 110, 86, 0.2)', animation: 'pulse 2s infinite' }} />
            $1
          </div>`
      );
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, code, 'utf8');
      console.log('Fixed', file);
    }
  });

  // 5. Force MetricCards.css to be absolutely explicit
  const metricCardsPath = 'src/components/layout/MetricCards.css';
  if (fs.existsSync(metricCardsPath)) {
    const cssContent = `/* src/components/layout/MetricCards.css */
.stat-card, .hod-stat-card, .staff-stat-card, .s-metric-card,
.stat-card.glass-card, .hod-stat-card.glass-card, .staff-stat-card.glass-card, .s-metric-card.glass-card {
  border: 1px solid var(--border-color) !important;
  box-shadow: var(--shadow-sm) !important;
  border-radius: 12px !important;
  background: #FFFFFF !important;
  background-color: #FFFFFF !important;
  transition: all 0.3s ease !important;
}
.stat-card:hover, .hod-stat-card:hover, .staff-stat-card:hover, .s-metric-card:hover {
  box-shadow: var(--shadow-md) !important;
  transform: translateY(-2px);
}
.stat-card h3, .stat-card p, .stat-card span, .stat-card h2,
.hod-stat-card h3, .hod-stat-card p, .hod-stat-card span, .hod-stat-card h2,
.staff-stat-card h3, .staff-stat-card p, .staff-stat-card span, .staff-stat-card h2,
.s-metric-card h3, .s-metric-card p, .s-metric-card span, .s-metric-card h2 {
  color: #0F172A !important;
  text-transform: none !important;
}
.stat-card p.stat-change, .stat-card span.stat-change, .stat-change.text-muted,
.hod-stat-card p.stat-change, .staff-stat-card p.stat-change, .s-metric-card p.stat-change {
  color: #64748B !important;
}
.stat-card .stat-change.positive, .hod-stat-card .text-success, .staff-stat-card .text-success, .s-metric-card .text-success {
  color: #0F6E56 !important;
  font-weight: 600 !important;
}
.stat-card .stat-change.negative, .hod-stat-card .text-danger, .staff-stat-card .text-danger, .s-metric-card .text-danger {
  color: #A32D2D !important;
  font-weight: 600 !important;
}
.stat-icon-wrapper.bg-icon-primary {
  background: #EEEDFE !important;
  color: #3C3489 !important;
}
.stat-icon-wrapper.bg-icon-warning {
  background: rgba(133, 79, 11, 0.1) !important;
  color: #854F0B !important;
}`;
    fs.writeFileSync(metricCardsPath, cssContent, 'utf8');
  }

  // Check Dashboard.css for any .stat-card overrides that might be lingering
  const dashCssPath = 'src/pages/Dashboard.css';
  if (fs.existsSync(dashCssPath)) {
    let dashCss = fs.readFileSync(dashCssPath, 'utf8');
    let dashChanged = false;
    
    // Remove any linear-gradient or bg-gradient-* classes
    if (dashCss.includes('bg-gradient-')) {
      dashCss = dashCss.replace(/\.bg-gradient-[^{]+\{[^}]+\}/g, '');
      dashChanged = true;
    }
    
    if (dashChanged) {
      fs.writeFileSync(dashCssPath, dashCss, 'utf8');
    }
  }
};

fixAbsolutelyEverything();
