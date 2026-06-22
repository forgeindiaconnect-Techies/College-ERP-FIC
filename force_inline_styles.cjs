const fs = require('fs');

const forceInline = () => {
  // 1. Staff Dashboard
  const staffFile = 'src/staff/pages/StaffDashboard.jsx';
  if (fs.existsSync(staffFile)) {
    let code = fs.readFileSync(staffFile, 'utf8');

    // Force banner background
    code = code.replace(
      /<div className="staff-welcome-banner">/g,
      '<div className="staff-welcome-banner" style={{ background: "#3730A5", color: "#fff" }}>'
    );

    // Force icon backgrounds
    code = code.replace(
      /<div className="staff-stat-icon bg-icon-primary">/g,
      '<div className="staff-stat-icon bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>'
    );
    code = code.replace(
      /<div className=\{`staff-stat-icon \$\{([^}]+)\}`\}>/g,
      '<div className={`staff-stat-icon ${$1}`} style={{ background: $1.includes("warning") ? "rgba(133, 79, 11, 0.1)" : "rgba(15, 110, 86, 0.1)", color: $1.includes("warning") ? "#854F0B" : "#0F6E56" }}>'
    );

    fs.writeFileSync(staffFile, code, 'utf8');
  }

  // 2. HOD Dashboard
  const hodFile = 'src/hod/pages/HodDashboard.jsx';
  if (fs.existsSync(hodFile)) {
    let code = fs.readFileSync(hodFile, 'utf8');

    // Force banner background
    code = code.replace(
      /<div className="hod-welcome-banner">/g,
      '<div className="hod-welcome-banner" style={{ background: "#3730A5", color: "#fff" }}>'
    );

    // Force icon backgrounds
    code = code.replace(
      /<div className=\{`hod-stat-icon bg-icon-primary`\}>/g,
      '<div className="hod-stat-icon bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>'
    );
    code = code.replace(
      /<div className="hod-stat-icon bg-icon-primary">/g,
      '<div className="hod-stat-icon bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>'
    );
    code = code.replace(
      /<div className="hod-stat-icon bg-icon-warning">/g,
      '<div className="hod-stat-icon bg-icon-warning" style={{ background: "rgba(133, 79, 11, 0.1)", color: "#854F0B" }}>'
    );

    fs.writeFileSync(hodFile, code, 'utf8');
  }

  // 3. Principal Dashboard
  const principalFile = 'src/principal/pages/PrincipalDashboard.jsx';
  if (fs.existsSync(principalFile)) {
    let code = fs.readFileSync(principalFile, 'utf8');

    // Force icon backgrounds
    code = code.replace(
      /<div className="stat-icon-wrapper bg-icon-primary">/g,
      '<div className="stat-icon-wrapper bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>'
    );

    fs.writeFileSync(principalFile, code, 'utf8');
  }

  // 4. Admin Dashboard
  const adminFile = 'src/pages/Dashboard.jsx';
  if (fs.existsSync(adminFile)) {
    let code = fs.readFileSync(adminFile, 'utf8');

    // Force icon backgrounds
    code = code.replace(
      /<div className="stat-icon-wrapper bg-icon-primary">/g,
      '<div className="stat-icon-wrapper bg-icon-primary" style={{ background: "#EEEDFE", color: "#3C3489" }}>'
    );
    code = code.replace(
      /<div className="stat-icon-wrapper bg-icon-warning">/g,
      '<div className="stat-icon-wrapper bg-icon-warning" style={{ background: "rgba(133, 79, 11, 0.1)", color: "#854F0B" }}>'
    );

    fs.writeFileSync(adminFile, code, 'utf8');
  }

  // 5. General Dashboard.css text-transform
  const dashboardCss = 'src/pages/Dashboard.css';
  if (fs.existsSync(dashboardCss)) {
    let css = fs.readFileSync(dashboardCss, 'utf8');
    css = css.replace(/\.stat-card h3[\s\S]*?\{[\s\S]*?\}/g, '.stat-card h3 { text-transform: none !important; }');
    fs.writeFileSync(dashboardCss, css, 'utf8');
  }
};

forceInline();
