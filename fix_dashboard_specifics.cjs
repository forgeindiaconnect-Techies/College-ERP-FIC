const fs = require('fs');

// Principal Dashboard Fixes
const fixPrincipal = () => {
  const file = 'src/principal/pages/PrincipalDashboard.jsx';
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Division Header Background
  code = code.replace(
    /background:\s*'linear-gradient\(to right,\s*rgba\(99,\s*102,\s*241,0\.1\),\s*transparent\)'/g,
    "background: 'var(--bg-secondary)'"
  );
  code = code.replace(
    /style={{ color:\s*'#6366F1'\s*}}/g,
    "style={{ color: 'var(--primary)' }}"
  );

  // 2. HOD / Staff / Student Pills
  code = code.replace(
    /background:\s*'rgba\(124,\s*58,\s*237,\s*0\.1\)',\s*color:\s*'#7C3AED'/g,
    "background: 'var(--primary-tint)', color: 'var(--on-primary-tint)'"
  );
  code = code.replace(
    /background:\s*'rgba\(139,\s*92,\s*246,\s*0\.1\)',\s*color:\s*'#8B5CF6'/g,
    "background: 'var(--primary-tint)', color: 'var(--on-primary-tint)'"
  );
  code = code.replace(
    /background:\s*'rgba\(37,\s*99,\s*235,\s*0\.1\)',\s*color:\s*'#2563EB'/g,
    "background: 'var(--primary-tint)', color: 'var(--on-primary-tint)'"
  );

  // 3. User Cards borders
  code = code.replace(/borderLeft:\s*'4px solid #[A-Fa-f0-9]{6}'/g, "borderLeft: '4px solid var(--primary)'");
  code = code.replace(/border:\s*'1px solid rgba\([0-9\s,.]+\)'/g, "border: '1px solid var(--border-color)'");

  fs.writeFileSync(file, code, 'utf8');
  console.log('Fixed PrincipalDashboard.jsx');
};

// Staff Dashboard Fixes
const fixStaff = () => {
  const file = 'src/staff/pages/StaffDashboard.jsx';
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Banner text effect (Staff in black, Dashboard Overview in gradient cyan)
  // Look for text elements with gradients
  code = code.replace(
    /<span[^>]*style={{[^}]*WebkitTextFillColor:\s*'transparent'[^}]*}}[^>]*>([\s\S]*?)<\/span>/g,
    "<span style={{ color: '#fff' }}>$1</span>"
  );
  code = code.replace(
    /color:\s*'var\(--text-main\)'/g,
    "color: '#fff'" // Force banner text to white if it was text-main
  );

  // 2. + New Request button (amber/orange)
  // Usually background: '#f59e0b' or var(--warning)
  code = code.replace(
    /background:\s*'#f59e0b'/g,
    "background: 'var(--primary)'"
  );
  code = code.replace(
    /background:\s*'var\(--warning\)'/g,
    "background: 'var(--primary)'"
  );
  code = code.replace(
    /boxShadow:\s*'0 4px 14px 0 rgba\(245,\s*158,\s*11,\s*0\.39\)'/g,
    "boxShadow: '0 4px 14px 0 rgba(55, 48, 165, 0.39)'"
  );

  fs.writeFileSync(file, code, 'utf8');
  console.log('Fixed StaffDashboard.jsx');
};

// HOD Dashboard Fixes
const fixHod = () => {
  const file = 'src/hod/pages/HodDashboard.jsx';
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Ghost overlapping text bug (two absolute positioned texts)
  // Often it's a decorative h1 behind the main h1 with position: absolute and opacity
  code = code.replace(
    /<h1[^>]*style={{[^}]*position:\s*'absolute'[^}]*opacity:\s*0\.\d[^}]*}}[^>]*>[\s\S]*?<\/h1>/g,
    ""
  );

  // 2. "Low Attendance Students" in warning amber tint
  if (code.includes('Low Attendance') && code.includes('bg-icon-primary')) {
    code = code.replace(
      /<div className="stat-icon-wrapper bg-icon-primary">(\s*<AlertTriangle)/g,
      '<div className="stat-icon-wrapper bg-icon-warning">$1'
    );
  }

  // 3. Charts: Teal line and Orange bars -> var(--primary)
  code = code.replace(
    /stroke="#14B8A6"/g,
    'stroke="var(--primary)"'
  );
  code = code.replace(
    /fill="#14B8A6"/g,
    'fill="var(--primary)"'
  );
  code = code.replace(
    /stroke="#F97316"/g,
    'stroke="var(--primary)"'
  );
  code = code.replace(
    /fill="#F97316"/g,
    'fill="var(--primary)"'
  );

  fs.writeFileSync(file, code, 'utf8');
  console.log('Fixed HodDashboard.jsx');
};

fixPrincipal();
fixStaff();
fixHod();
