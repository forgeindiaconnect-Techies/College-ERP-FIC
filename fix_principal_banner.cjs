const fs = require('fs');

const principalFile = 'src/principal/pages/PrincipalDashboard.jsx';
if (fs.existsSync(principalFile)) {
  let code = fs.readFileSync(principalFile, 'utf8');

  // Force banner background to #3730A5
  code = code.replace(
    /background:\s*'var\(--primary\)',/g,
    "background: '#3730A5',"
  );

  fs.writeFileSync(principalFile, code, 'utf8');
}
