const fs = require('fs');

const fixStaff = () => {
  const file = 'src/staff/pages/StaffDashboard.jsx';
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Fix banner text
  code = code.replace(
    /<h1>Staff <span style={{ color: '#fff' }}>Dashboard Overview<\/span><\/h1>/g,
    '<h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px 0" }}>Staff Dashboard Overview</h1>'
  );
  code = code.replace(
    /<h1>Staff <span className="gradient-text-blue">Dashboard Overview<\/span><\/h1>/g,
    '<h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px 0" }}>Staff Dashboard Overview</h1>'
  );

  // Fix the subtext color
  code = code.replace(
    /<p className="staff-welcome-sub">/g,
    '<p className="staff-welcome-sub" style={{ margin: 0, opacity: 0.9, fontSize: "0.85rem", fontWeight: 500, color: "#fff" }}>'
  );

  // Remove any extra text coloring classes
  code = code.replace(/<span className="gradient-text-[a-z]+">/g, '<span>');

  fs.writeFileSync(file, code, 'utf8');
  console.log('Fixed StaffDashboard banner text');
};

const fixHod = () => {
  const file = 'src/hod/pages/HodDashboard.jsx';
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Fix banner text
  code = code.replace(
    /<h1>Department <span className="gradient-text-purple">Dashboard Overview<\/span><\/h1>/g,
    '<h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px 0" }}>Department Dashboard Overview</h1>'
  );

  // Fix the subtext color
  code = code.replace(
    /<p className="hod-welcome-sub">/g,
    '<p className="hod-welcome-sub" style={{ margin: 0, opacity: 0.9, fontSize: "0.85rem", fontWeight: 500, color: "#fff" }}>'
  );

  fs.writeFileSync(file, code, 'utf8');
  console.log('Fixed HodDashboard banner text');
};

fixStaff();
fixHod();
