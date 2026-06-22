const fs = require('fs');

const fixFile = (path, replacements) => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    let changed = false;
    for (const { regex, replacement } of replacements) {
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(path, content, 'utf8');
      console.log('Fixed', path);
    }
  }
};

// StaffDashboard.jsx
fixFile('src/staff/pages/StaffDashboard.jsx', [
  {
    regex: /<div className="staff-stat-card">/g,
    replacement: '<div className="staff-stat-card" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>'
  },
  {
    regex: /<div className="staff-stat-details">\s*<p className="staff-stat-label">([^<]+)<\/p>\s*<p className="staff-stat-value">([^<]+)<\/p>\s*<p className="staff-stat-sub text-muted">([^<]+)<\/p>\s*<\/div>/g,
    replacement: '<div className="staff-stat-details">\n            <p className="staff-stat-label" style={{ fontWeight: 600, color: "#6b7280" }}>$1</p>\n            <p className="staff-stat-value" style={{ fontWeight: 700, color: "#111827" }}>$2</p>\n            <p className="staff-stat-sub text-muted" style={{ fontSize: "0.72rem", color: "#9ca3af", margin: 0, fontWeight: 500 }}>$3</p>\n          </div>'
  },
  {
    regex: /<div>\s*<p className="staff-stat-label">([^<]+)<\/p>\s*<p className="staff-stat-value">([^<]+)<\/p>\s*<p className="staff-stat-sub text-muted">([^<]+)<\/p>\s*<\/div>/g,
    replacement: '<div className="staff-stat-details">\n            <p className="staff-stat-label" style={{ fontWeight: 600, color: "#6b7280" }}>$1</p>\n            <p className="staff-stat-value" style={{ fontWeight: 700, color: "#111827" }}>$2</p>\n            <p className="staff-stat-sub text-muted" style={{ fontSize: "0.72rem", color: "#9ca3af", margin: 0, fontWeight: 500 }}>$3</p>\n          </div>'
  },
  {
    regex: /<div>\s*<p className="staff-stat-label">([^<]+)<\/p>\s*<p className="staff-stat-value">([^<]+)<\/p>\s*<p className="staff-stat-sub text-success">([^<]+)<\/p>\s*<\/div>/g,
    replacement: '<div className="staff-stat-details">\n            <p className="staff-stat-label" style={{ fontWeight: 600, color: "#6b7280" }}>$1</p>\n            <p className="staff-stat-value" style={{ fontWeight: 700, color: "#111827" }}>$2</p>\n            <p className="staff-stat-sub text-success" style={{ fontSize: "0.72rem", color: "#10b981", margin: 0, fontWeight: 500 }}>$3</p>\n          </div>'
  },
  {
    regex: /<div>\s*<p className="staff-stat-label">([^<]+)<\/p>\s*<p className="staff-stat-value">([^<]+)<\/p>\s*<p className="staff-stat-sub text-danger">([^<]+)<\/p>\s*<\/div>/g,
    replacement: '<div className="staff-stat-details">\n            <p className="staff-stat-label" style={{ fontWeight: 600, color: "#6b7280" }}>$1</p>\n            <p className="staff-stat-value" style={{ fontWeight: 700, color: "#111827" }}>$2</p>\n            <p className="staff-stat-sub text-danger" style={{ fontSize: "0.72rem", color: "#ef4444", margin: 0, fontWeight: 500 }}>$3</p>\n          </div>'
  },
  {
    regex: /<div>\s*<p className="staff-stat-label">([^<]+)<\/p>\s*<p className={`staff-stat-value text-sm \${([^}]+)}`} style={{ marginTop: '5px', fontSize: '1.2rem', fontWeight: 700 }}>\s*([^<]+)\s*<\/p>\s*<p className="staff-stat-sub text-muted">([^<]+)<\/p>\s*<\/div>/g,
    replacement: '<div className="staff-stat-details">\n            <p className="staff-stat-label" style={{ fontWeight: 600, color: "#6b7280" }}>$1</p>\n            <p className={`staff-stat-value text-sm \${$2}`} style={{ marginTop: "5px", fontSize: "1.2rem", fontWeight: 700, color: $2.includes("danger") ? "#ef4444" : "#10b981" }}>\n              $3\n            </p>\n            <p className="staff-stat-sub text-muted" style={{ fontSize: "0.72rem", color: "#9ca3af", margin: 0, fontWeight: 500 }}>$4</p>\n          </div>'
  }
]);

// HodDashboard.css
fixFile('src/hod/pages/HodDashboard.css', [
  {
    regex: /\.hod-stat-icon\.(purple|indigo|green|amber|pink|red|teal)\s*\{[^}]+\}/g,
    replacement: '' // Remove colorful specific icon classes just in case
  }
]);

// StaffDashboard.css
fixFile('src/staff/pages/StaffDashboard.css', [
  {
    regex: /\.staff-stat-icon\.(blue|emerald|indigo|amber|red|purple)\s*\{[^}]+\}/g,
    replacement: '' // Remove colorful specific icon classes just in case
  }
]);
