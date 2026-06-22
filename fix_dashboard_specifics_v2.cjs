const fs = require('fs');

// Staff Dashboard Fixes
const fixStaff = () => {
  const file = 'src/staff/pages/StaffDashboard.jsx';
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Banner text effect
  code = code.replace(
    /<h1>Staff <span className="gradient-text-blue">Dashboard Overview<\/span><\/h1>/g,
    '<h1>Staff <span style={{ color: "white" }}>Dashboard Overview</span></h1>'
  );

  // 2. 6 stat cards rainbow -> staff-stat-icon blue etc to bg-icon-primary
  // They look like <div className="staff-stat-icon blue">
  const colors = ['blue', 'emerald', 'indigo', 'amber', 'red', 'purple'];
  colors.forEach(c => {
    code = code.replace(new RegExp(`className="staff-stat-icon ${c}"`, 'g'), 'className="staff-stat-icon bg-icon-primary"');
  });

  // Exception for Attendance Status: amber
  // We need to change the bg-icon-primary back to bg-icon-warning for the Attendance card.
  // The Attendance card has CalendarCheck.
  code = code.replace(
    /<div className="staff-stat-icon bg-icon-primary">\s*<CalendarCheck size=\{22\} \/>/g,
    '<div className="staff-stat-icon bg-icon-warning">\n            <CalendarCheck size={22} />'
  );

  fs.writeFileSync(file, code, 'utf8');

  // StaffDashboard.css
  const cssFile = 'src/staff/pages/StaffDashboard.css';
  if (fs.existsSync(cssFile)) {
    let css = fs.readFileSync(cssFile, 'utf8');
    
    // Fix New Request button
    // Look for .btn-add-leave
    css = css.replace(/background-color:\s*#f59e0b/g, 'background-color: var(--primary)');
    css = css.replace(/background:\s*#f59e0b/g, 'background: var(--primary)');
    css = css.replace(/box-shadow:\s*0 4px 14px 0 rgba\(245,\s*158,\s*11,\s*0\.39\)/g, 'box-shadow: 0 4px 14px 0 rgba(55, 48, 165, 0.39)');

    fs.writeFileSync(cssFile, css, 'utf8');
  }
};

const fixHod = () => {
  const file = 'src/hod/pages/HodDashboard.jsx';
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Ghost overlapping text bug (two absolute positioned texts)
  // Usually looks like `<h1 style={{ ... opacity: 0.1, position: 'absolute' }}>`
  // Actually, I'll just remove ANY h1 that has position: 'absolute'
  code = code.replace(
    /<h1[^>]*style={{[^}]*position:\s*'absolute'[^}]*}}[^>]*>[\s\S]*?<\/h1>/g,
    ""
  );
  // Also look for `className="bg-text"` or similar
  code = code.replace(
    /<div className="bg-text"[^>]*>[\s\S]*?<\/div>/g,
    ""
  );

  // 2. 8 stat cards rainbow problem.
  // Could be `className="hod-stat-icon blue"`
  const colors = ['blue', 'emerald', 'indigo', 'amber', 'red', 'purple', 'green', 'orange', 'teal', 'cyan', 'rose'];
  colors.forEach(c => {
    code = code.replace(new RegExp(`className="hod-stat-icon ${c}"`, 'g'), 'className="hod-stat-icon bg-icon-primary"');
    code = code.replace(new RegExp(`className="stat-icon-wrapper ${c}"`, 'g'), 'className="stat-icon-wrapper bg-icon-primary"');
  });

  // Low Attendance exception (AlertTriangle)
  code = code.replace(
    /className="[a-zA-Z\s-]*bg-icon-primary">\s*<AlertTriangle/g,
    'className="hod-stat-icon bg-icon-warning">\n            <AlertTriangle'
  );

  fs.writeFileSync(file, code, 'utf8');

  const cssFile = 'src/hod/pages/HodDashboard.css';
  if (fs.existsSync(cssFile)) {
    let css = fs.readFileSync(cssFile, 'utf8');
    // If there's an overlapping text class
    css = css.replace(/\.bg-text\s*{[^}]+}/g, '');
    fs.writeFileSync(cssFile, css, 'utf8');
  }
};

fixStaff();
fixHod();
